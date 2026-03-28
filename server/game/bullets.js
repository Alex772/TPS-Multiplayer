const { players } = require("./players");
const { ITEMS } = require("./items");

let bullets = [];

function handleShoot(id, data) {
    let p = players[id];
    if (!p) return;

    const weapon = ITEMS[p.weapon];
    if (!weapon) return;

    const now = Date.now();

    if (now - p.lastShot < weapon.fireRate) return;

    p.lastShot = now; // 👈 AQUI SIM




    console.log("ammo:", p.ammoInMag);
    
    if (p.ammoInMag <= 0) return;

    p.ammoInMag--;

    bullets.push({
        x: p.x,
        y: p.y,
        dx: data.dx,
        dy: data.dy,
        life: 100,
        owner: id
    });

    console.log("🔥 bala criada");
}

module.exports = { bullets, handleShoot };