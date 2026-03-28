const { players } = require("./players");
const { bullets } = require("./bullets");
const { checkHit } = require("./collision");
const { isWall, isBulletBlocked, tryPickupItem, damageObject, layers } = require("./map");
const TICK = 1000 / 60;

const PLAYER_SIZE = 0.1;
const HALF = PLAYER_SIZE / 2;

function gameLoop(io) {

    setInterval(() => {

        // =====================
        // MOVE PLAYERS
        // =====================
        for (let id in players) {
            let p = players[id];

            let nextX = p.x + p.vx * 0.1;
            let nextY = p.y + p.vy * 0.1;

            // =====================
            // COLISÃO NO EIXO X
            // =====================

            // nextX - HALF → lado esquerdo do player
            // nextX + HALF → lado direito do player
            // p.y - HALF → topo do player
            // p.y + HALF → base do player

            // esq - dir
            if (
                !isWall(nextX - HALF, p.y - HALF, p) &&    // Canto superior esquerdo
                !isWall(nextX + HALF, p.y - HALF, p) &&    // Canto superior direito
                !isWall(nextX - HALF, p.y + HALF, p) &&    // Canto inferior esquerdo
                !isWall(nextX + HALF, p.y + HALF, p)       // Canto inferior direito
            ) {
                p.x = nextX;
            }

            // =====================
            // COLISÃO NO EIXO Y
            // =====================
            // up - down
            if (
                !isWall(p.x - HALF, nextY - HALF, p) &&    // canto superior esquerdo
                !isWall(p.x + HALF, nextY - HALF, p) &&    // Canto superior direito
                !isWall(p.x - HALF, nextY + HALF, p) &&    // Canto inferior esquerdo
                !isWall(p.x + HALF, nextY + HALF, p)       // Canto inferior direito
            ) {
                p.y = nextY;
            }

            // =====================
            // ITEM PICKUP
            // =====================
            let item = tryPickupItem(p.x, p.y);
            if (item) {
                // Poderia adicionar arma ou munição ao player
                // p.gun = item; etc.
            }
        }

        // =====================
        // MOVE BULLETS
        // =====================
        for (let i = bullets.length - 1; i >= 0; i--) {
            let b = bullets[i];

            b.x += b.dx * 0.3;
            b.y += b.dy * 0.3;
            b.life--;

            // 🔥 NOVO: colisão com parede ou objeto (com chance de passar)
            if (isBulletBlocked(b.x, b.y, b.isOver)) {
                bullets.splice(i, 1);
                continue;
            }


            
            // colisão com players
            for (let id in players) {
                if (id === b.owner) continue;

                
                let p = players[id];

                // Ignora a colisão se o jogador estiver morto
                if (p.spectador) {
                    continue;
                }

                if (checkHit(b, p)) {
                    p.hp -= 20;
                    bullets.splice(i, 1);

                    if (p.hp <= 0) {
                        p.spectador = true;
                        //console.log("🔥 Player", id, "morreu");
                    }

                    break;
                }
            }

            if (b.life <= 0) {
                bullets.splice(i, 1);
            }
        }

        // =====================
        // ENVIA ESTADO
        // =====================
        io.emit("state", {
            players,
            bullets,
            map: layers
        });

    }, TICK);
}

module.exports = { gameLoop };