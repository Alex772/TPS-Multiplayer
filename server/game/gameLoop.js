// server/game/gameLoop.js

const { players, getCurrentWeapon } = require("./players");
const { bullets } = require("./bullets");
const { saveSnapshot } = require("./snapshots");
const { getWeapon } = require("./weapons");

const {
    isWall,
    tryPickupItem,
    MAP_WIDTH,
    MAP_HEIGHT,
    isBulletBlocked
} = require("./map");

const TICK = 1000 / 60;

const SPEED = 0.05;
const BULLET_STEPS = 1;

function gameLoop(io, buildState) {
    setInterval(() => {
        const now = Date.now();

        // =====================
        // 📸 SNAPSHOT
        // =====================
        saveSnapshot(players);

        // =====================
        // 👤 PLAYERS UPDATE
        // =====================
        for (let id in players) {
            const p = players[id];
            if (!p || !p.input) continue;

            // =====================
            // 🔄 TROCA DE ARMA
            // =====================
            if (p.isSwitching && now >= p.switchEndTime) {
                p.isSwitching = false;

                if (p.nextWeapon) {
                    p.loadout.current = p.nextWeapon;
                    p.nextWeapon = null;

                    // 🔥 ao trocar de arma, recoil da arma equipada zera
                    const newWeaponState = getCurrentWeapon(p);
                    if (newWeaponState) {
                        newWeaponState.recoilCurrent = 0;
                    }
                }
            }

            const weaponState = getCurrentWeapon(p);
            if (!weaponState) continue;

            const weapon = getWeapon(weaponState.weaponId);
            if (!weapon) continue;

            // =====================
            // 🔁 RECOIL RECOVERY
            // =====================
            weaponState.recoilCurrent -= weapon.recoil.recovery;
            if (weaponState.recoilCurrent < 0) {
                weaponState.recoilCurrent = 0;
            }

            // =====================
            // 🔄 RELOAD
            // =====================
            // regra do jogo:
            // recarregar descarta o pente atual e equipa outro cheio
            if (weaponState.isReloading && now >= weaponState.reloadEndTime) {
                if (weaponState.magsLeft > 0) {
                    weaponState.ammoInMag = weapon.magSize;
                    weaponState.magsLeft--;
                }

                weaponState.isReloading = false;
                weaponState.reloadEndTime = 0;
            }

            // =====================
            // 🚶 MOVIMENTO
            // =====================
            let dx = 0;
            let dy = 0;

            if (p.input.up) dx += 0, dy -= 1;
            if (p.input.down) dy += 1;
            if (p.input.left) dx -= 1;
            if (p.input.right) dx += 1;

            const len = Math.hypot(dx, dy);
            if (len > 0) {
                dx /= len;
                dy /= len;
            }

            const newX = p.x + dx * SPEED;
            const newY = p.y + dy * SPEED;

            if (p.hp <= 0) {
                // morto / fantasma
                if (newX >= 0 && newX <= MAP_WIDTH) p.x = newX;
                if (newY >= 0 && newY <= MAP_HEIGHT) p.y = newY;
            } else {
                if (!isWall(newX, p.y)) p.x = newX;
                if (!isWall(p.x, newY)) p.y = newY;
            }

            // =====================
            // 📦 PICKUP
            // =====================
            tryPickupItem(p.x, p.y);

            // =====================
            // ✅ RECONCILIAÇÃO
            // =====================
            if (p.input.seq !== undefined) {
                p.lastProcessedInput = p.input.seq;
            }
        }

        // =====================
        // 🔥 BULLETS
        // =====================
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            if (!b) continue;

            for (let step = 0; step < BULLET_STEPS; step++) {
                // 🔥 cada bala usa sua própria velocidade
                const bulletSpeed = b.speed ?? 0.2;
                const stepSpeed = bulletSpeed / BULLET_STEPS;

                b.x += b.dx * stepSpeed;
                b.y += b.dy * stepSpeed;

                b.distanceTraveled += stepSpeed;

                // =====================
                // RANGE
                // =====================
                if (b.distanceTraveled >= b.range) {
                    bullets.splice(i, 1);
                    break;
                }

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
                    bullets.splice(i, 1);
                    break;
                }

                // =====================
                // 🎯 HIT PLAYER
                // =====================
                for (let id in players) {
                    const realPlayer = players[id];
                    const snapshotPlayer = b.snapshotPlayers?.[id] || realPlayer;

                    if (!realPlayer || !snapshotPlayer) continue;
                    if (id === b.owner) continue;
                    if (realPlayer.espectador) continue;
                    if (realPlayer.hp <= 0) continue;

                    const dx = snapshotPlayer.x - b.x;
                    const dy = snapshotPlayer.y - b.y;
                    const dist = Math.hypot(dx, dy);

                    const HIT_RADIUS = 0.4;

                    if (dist < HIT_RADIUS) {
                        realPlayer.hp -= b.damage;

                        const owner = players[b.owner];
                        if (owner) owner.hit = true;

                        bullets.splice(i, 1);

                        if (realPlayer.hp <= 0) {
                            realPlayer.hp = 0;
                            realPlayer.espectador = true;
                            console.log("☠️ jogador morreu:", id);
                        }

                        break;
                    }
                }

                // se a bala já foi removida, sai do loop
                if (!bullets[i]) break;
            }
        }

        // =====================
        // 📡 ENVIO
        // =====================
        io.emit("state", buildState());

        // =====================
        // LIMPA FLAGS RÁPIDAS
        // =====================
        for (let id in players) {
            if (players[id]) {
                players[id].hit = false;
            }
        }
    }, TICK);
}

module.exports = { gameLoop };