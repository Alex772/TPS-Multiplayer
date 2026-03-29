//server/game/bullets.js

const { players } = require("./players");
const { getSnapshotAt } = require("./snapshots"); // 🔥 NOVO

let bullets = [];

function handleShoot(id, data) {

    const p = players[id];
    if (!p) return;

    const now = Date.now();

    // =========================
    // 🔥 VALIDAÇÃO DE TEMPO
    // =========================
    const shotTime = Number(data.time);
    const ping = Number(data.ping) || 0;

    if (!isFinite(shotTime)) return;

    // 🔥 calcula tempo REAL do tiro
    const realShotTime = shotTime - (ping / 2);

    // =========================
    // 🔥 PEGA SNAPSHOT DO PASSADO
    // =========================
    const snapshot = getSnapshotAt(realShotTime);

    // fallback (se não achar snapshot)
    let snapshotPlayers = players;

    if (snapshot && snapshot.players) {
        snapshotPlayers = snapshot.players;
    }

    // =========================
    // 🔥 SPREAD
    // =========================
    const SPREAD = 0.05;

    let dx = data.dx + (Math.random() - 0.5) * SPREAD;
    let dy = data.dy + (Math.random() - 0.5) * SPREAD;

    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    dx /= len;
    dy /= len;

    // =========================
    // 🔥 BLOQUEIOS
    // =========================
    if (p.reloading) return;

    const FIRE_RATE = 200;
    if (now - p.lastShot < FIRE_RATE) return;

    if (p.ammoInMag <= 0) return;

    // =========================
    // 🔥 APLICA TIRO
    // =========================
    p.lastShot = now;
    p.ammoInMag--;

    bullets.push({
        x: p.x,
        y: p.y,
        dx: dx,
        dy: dy,
        life: 100,
        owner: id,
        damage: 20,

        // 🔥 ESSÊNCIA DA LAG COMP
        snapshotPlayers: snapshotPlayers,

        // opcional (debug)
        shotTime: realShotTime
    });
}

module.exports = { bullets, handleShoot };