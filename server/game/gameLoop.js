// server/game/gameLoop.js

const { players } = require("./players");
const { bullets } = require("./bullets");
const { saveSnapshot } = require("./snapshots");

const { processWeaponSwitch } = require("./combat/weaponSwitch");
const { processWeaponReload } = require("./combat/reloads");
const { recoverWeaponRecoil } = require("./combat/recoil");
const { updatePlayerMovement } = require("./movement/playerMovement");
const { tryHitPlayers } = require("./combat/hits");

const { isBulletBlocked } = require("./map");

const TICK = 1000 / 60;
const BULLET_STEPS = 1;

// ============================
// BULLETS
// ============================

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (!b) continue;

        for (let step = 0; step < BULLET_STEPS; step++) {
            const speed = b.speed ?? 0.2;
            const stepSpeed = speed / BULLET_STEPS;

            b.x += b.dx * stepSpeed;
            b.y += b.dy * stepSpeed;

            b.distanceTraveled += stepSpeed;

            if (b.distanceTraveled >= b.range) {
                bullets.splice(i, 1);
                break;
            }

            if (isBulletBlocked(b.x, b.y, b.isOver)) {
                bullets.splice(i, 1);
                break;
            }

            const hit = tryHitPlayers(b, () => bullets.splice(i, 1));
            if (hit) break;

            if (!bullets[i]) break;
        }
    }
}

// ============================
// MAIN LOOP
// ============================

function gameLoop(io, buildState) {
    setInterval(() => {
        const now = Date.now();

        saveSnapshot(players);

        for (let id in players) {
            const p = players[id];
            if (!p) continue;

            processWeaponSwitch(p, now);
            processWeaponReload(p, now);
            recoverWeaponRecoil(p);
            updatePlayerMovement(p);

            if (p.input?.seq !== undefined) {
                p.lastProcessedInput = p.input.seq;
            }
        }

        updateBullets();

        io.emit("state", buildState());

        for (let id in players) {
            if (players[id]) {
                players[id].hit = false;
            }
        }
    }, TICK);
}

module.exports = { gameLoop };