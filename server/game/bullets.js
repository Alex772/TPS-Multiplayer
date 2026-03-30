const { players } = require("./players");
const { getSnapshotAt } = require("./snapshots");

let bullets = [];

// ============================
// 🔥 ID GLOBAL DE BALAS (SERVER)
// ============================
let bulletIdCounter = 0;

function generateBulletId() {
    return `b_${bulletIdCounter++}`;
}

// ============================
// 🔫 CONFIG DE ARMAS
// ============================

const WEAPONS = {
    pistol: {
        range: 600,
        damage: 20,
        fireRate: 200,
        spread: 0.05
    },
    rifle: {
        range: 900,
        damage: 15,
        fireRate: 100,
        spread: 0.03
    }
};

function handleShoot(id, data) {

    const p = players[id];
    if (!p) return;

    const now = Date.now();

    const weaponName = p.weapon || "pistol";
    const weapon = WEAPONS[weaponName] || WEAPONS.pistol;

    // =========================
    // TIME VALIDATION
    // =========================
    const shotTime = Number(data.time);
    const ping = Number(data.ping) || 0;

    if (!isFinite(shotTime)) return;

    const realShotTime = shotTime - (ping / 2);

    // =========================
    // SNAPSHOT
    // =========================
    const snapshot = getSnapshotAt(realShotTime);

    let snapshotPlayers = players;

    if (snapshot && snapshot.players) {
        snapshotPlayers = snapshot.players;
    }

    // =========================
    // SPREAD
    // =========================
    let dx = data.dx + (Math.random() - 0.5) * weapon.spread;
    let dy = data.dy + (Math.random() - 0.5) * weapon.spread;

    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    dx /= len;
    dy /= len;

    // =========================
    // BLOQUEIOS
    // =========================
    if (p.reloading) return;

    if (now - p.lastShot < weapon.fireRate) return;

    if (p.ammoInMag <= 0) return;

    // =========================
    // APLICA TIRO
    // =========================
    p.lastShot = now;
    p.ammoInMag--;

    bullets.push({
        id: generateBulletId(), // 🔥 AGORA SERVER AUTHORITATIVE

        x: p.x,
        y: p.y,

        dx: dx,
        dy: dy,

        speed: 0.5,

        range: weapon.range,
        distanceTraveled: 0,

        owner: id,
        damage: weapon.damage,

        snapshotPlayers: snapshotPlayers,
        shotTime: realShotTime
    });
}

module.exports = { bullets, handleShoot };