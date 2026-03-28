const { players } = require("./players");
const { ITEMS } = require("./items");

let bullets = [];

// ============================
// BULLETS
// ============================
function handleShoot(id, data) {
    let p = players[id];
    if (!p) return;

    const weapon = ITEMS[p.weapon];
    if (!weapon) return;

    const now = Date.now();

    // ⛔ CONTROLE DE FIRE RATE
    if (now - p.lastShot < weapon.fireRate) {
        return;
    }

    // ⛔ SEM MUNIÇÃO NO PENTE
    if (p.ammoInMag <= 0) {
        return;
    }

    p.lastShot = now;

    // 🔻 GASTA MUNIÇÃO
    p.ammoInMag--;

    // 🔫 CRIA BALA
    bullets.push({
        x: p.x,
        y: p.y,

        dx: data.dx,
        dy: data.dy,

        life: 100,
        owner: id,

        damage: weapon.damage, // 👈 NOVO

        isOver: Math.random() < 0.5
    });
}

module.exports = { bullets, handleShoot };