const { players } = require("./players");
const { bullets } = require("./bullets");
const { isWall, tryPickupItem, layers, MAP_WIDTH, MAP_HEIGHT} = require("./map");

const TICK = 1000 / 60;

function gameLoop(io) {

    setInterval(() => {


        // =====================
        // MOVE PLAYERS
        // =====================
        for (let id in players) {
            const p = players[id];
            

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

            const SPEED = 0.05;

            let newX = p.x + dx * SPEED;
            let newY = p.y + dy * SPEED;


            if(p.hp <= 0) {

                //Bloquear Saida do Mapa
                if (newX < 0 || newX > MAP_WIDTH) return;
                if (newY < 0 || newY > MAP_HEIGHT) return;

                // fantasma: movimento livre, sem colisão
                p.x = newX;
                p.y = newY;
            } else {
                // colisão com mapa
                if (!isWall(newX, p.y)) p.x = newX;
                if (!isWall(p.x, newY)) p.y = newY;

            }
            
            
        }


        // =====================
        // MOVE BULLETS + COLISÃO
        // =====================
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];

            const BULLET_SPEED = 0.2;

            b.x += b.dx * BULLET_SPEED;
            b.y += b.dy * BULLET_SPEED;

            b.life--;

            // 🔥 COLISÃO COM MAPA
            if (isWall(b.x, b.y)) {
                bullets.splice(i, 1);
                continue;
            }

            // 🔥 COLISÃO COM PLAYERS
            for (let id in players) {
                const p = players[id];

                


                // não acerta quem atirou
                if (id === b.owner) continue;

                // ignora espectador
                if (p.spectador) continue;

                // ignora morto
                if (p.hp <= 0) continue;

                const dx = p.x - b.x;
                const dy = p.y - b.y;

                const dist = Math.hypot(dx, dy);

                const HIT_RADIUS = 0.4;

                if (dist < HIT_RADIUS) {

                    // 💥 dano
                    p.hp -= b.damage;

                    console.log("💥 hit em", id, "hp:", p.hp);


                    // =========================
                    // 🔥 HITMARKER (AQUI!)
                    // =========================
                    const owner = players[b.owner];
                    if (owner) {
                        owner.hit = true;
                    }


                    // remove bala
                    bullets.splice(i, 1);

                    // morreu?
                    if (p.hp <= 0) {
                        p.spectador = true;
                        console.log("☠️ jogador morreu:", id);
                    }

                    break;
                }
            }

            // remove por tempo
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
        // limpa flags temporárias
        for (let id in players) {
            players[id].hit = false;
        }
    }, TICK);
}

module.exports = { gameLoop };