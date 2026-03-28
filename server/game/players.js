const players = {};

function createPlayer(id) {
    players[id] = {
        id,

        x: 2,
        y: 2,

        vx: 0,
        vy: 0,

        // 👇 NOVO SISTEMA
        weapon: "pistol",
        ammo: {
            light: 60
        },

        ammoInMag: 12,
        spectador: false,

        lastShot: 0 // controle de fireRate
    };
}

module.exports = { players, createPlayer };