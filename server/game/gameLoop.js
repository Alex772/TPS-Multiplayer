//server/game/gameLoop.js

const { players } = require("./players");
const { bullets } = require("./bullets");
const { saveSnapshot } = require("./snapshots");

const { 
    isWall, 
    tryPickupItem, 
    layers, 
    MAP_WIDTH, 
    MAP_HEIGHT, 
    isBulletBlocked 
} = require("./map");

const TICK = 1000 / 60;

const SPEED = 0.05;
const BULLET_SPEED = 0.2;

// quantidade de subdivisões
// n passa de 8 por garantia de pode causa lag
const BULLET_STEPS = 1;

function gameLoop(io, buildState) {

    setInterval(() => {

        // =====================
        // 📸 SALVA HISTÓRICO
        // =====================
        saveSnapshot(players);

        // =====================
        // MOVE PLAYERS (NORMAL)
        // =====================
        for (let id in players) {

            const p = players[id];
            if (!p || !p.input) continue;

            let dx = 0;
            let dy = 0;

            if (p.input.up) dy -= 1;
            if (p.input.down) dy += 1;
            if (p.input.left) dx -= 1;
            if (p.input.right) dx += 1;

            const len = Math.hypot(dx, dy);
            if (len > 0) {
                dx /= len;
                dy /= len;
            }

            let newX = p.x + dx * SPEED;
            let newY = p.y + dy * SPEED;

            // morto (fantasma)
            if (p.hp <= 0) {

                if (newX >= 0 && newX <= MAP_WIDTH) {
                    p.x = newX;
                }

                if (newY >= 0 && newY <= MAP_HEIGHT) {
                    p.y = newY;
                }

            } else {

                if (!isWall(newX, p.y)) p.x = newX;
                if (!isWall(p.x, newY)) p.y = newY;

                //tryPickupItem(p);
            }

            // reconciliação
            if (p.input.seq !== undefined) {
                p.lastProcessedInput = p.input.seq;
            }
        }

        // =====================
        // MOVE BULLETS + COLISÃO (CORRIGIDO)
        // =====================
        for (let i = bullets.length - 1; i >= 0; i--) {

            const b = bullets[i];

            // 🔥 SUBSTEPS (ANTI-TUNNELING)
            for (let step = 0; step < BULLET_STEPS; step++) {

                b.x += b.dx * (BULLET_SPEED / BULLET_STEPS);
                b.y += b.dy * (BULLET_SPEED / BULLET_STEPS);

                // =====================
                // COLISÃO ESPECIAL
                // =====================
                if (isBulletBlocked(b.x, b.y, b.isOver)) {
                    bullets.splice(i, 1);
                    break;
                }

                // =====================
                // PAREDE
                // =====================
                if (isWall(b.x, b.y)) {

                    // 🔥 opcional: volta um passo pra não grudar
                    b.x -= b.dx * (BULLET_SPEED / BULLET_STEPS);
                    b.y -= b.dy * (BULLET_SPEED / BULLET_STEPS);

                    bullets.splice(i, 1);
                    break;
                }

                // =====================
                // COLISÃO COM PLAYERS (LAG COMP)
                // =====================
                for (let id in players) {

                    const realPlayer = players[id];
                    const snapshotPlayer = b.snapshotPlayers?.[id] || realPlayer;

                    if (!realPlayer || !snapshotPlayer) continue;
                    if (id === b.owner) continue;
                    if (realPlayer.spectador) continue;
                    if (realPlayer.hp <= 0) continue;

                    const dx = snapshotPlayer.x - b.x;
                    const dy = snapshotPlayer.y - b.y;

                    const dist = Math.hypot(dx, dy);

                    const HIT_RADIUS = 0.4;

                    if (dist < HIT_RADIUS) {

                        // aplica no real
                        realPlayer.hp -= b.damage;

                        console.log("💥 hit em", id, "hp:", realPlayer.hp);

                        const owner = players[b.owner];
                        if (owner) owner.hit = true;

                        bullets.splice(i, 1);

                        if (realPlayer.hp <= 0) {
                            realPlayer.spectador = true;
                            console.log("☠️ jogador morreu:", id);
                        }

                        break;
                    }
                }

                // se bala já foi removida, sai do loop
                if (!bullets[i]) break;
            }

            // tempo de vida
            if (bullets[i]) {
                bullets[i].life--;

                if (bullets[i].life <= 0) {
                    bullets.splice(i, 1);
                }
            }
        }

        // =====================
        // ENVIA ESTADO
        // =====================
        io.emit("state", buildState());

        // limpa flags
        for (let id in players) {
            if (players[id]) {
                players[id].hit = false;
            }
        }

    }, TICK);
}

module.exports = { gameLoop };