const { players } = require("./players");

let bullets = [];

function handleShoot(id, data) {
    const p = players[id];
    if (!p) return;

    const now = Date.now();




    
    const SPREAD = 0.05;

    let dx = data.dx + (Math.random() - 0.5) * SPREAD;
    let dy = data.dy + (Math.random() - 0.5) * SPREAD;

    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;





    // 🔥 BLOQUEIA DURANTE RELOAD
    if (p.reloading) return;

    // 🔥 FIRE RATE
    const FIRE_RATE = 200;
    if (now - p.lastShot < FIRE_RATE) return;

    // 🔥 SEM MUNIÇÃO
    if (p.ammoInMag <= 0) return;

    p.lastShot = now;
    p.ammoInMag--;

    bullets.push({
        x: p.x,
        y: p.y,
        dx: dx,
        dy: dy,
        life: 100,
        owner: id,
        damage: 20
    });
}

module.exports = { bullets, handleShoot };