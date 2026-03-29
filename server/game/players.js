//server\game\players.js
const { layers  } = require("./map");
const players = {};



function getSpawn() {
    while (true) {
        let x = Math.floor(Math.random() * layers.collision[0].length);
        let y = Math.floor(Math.random() * layers.collision.length);
        if (layers.collision[y][x] === 0 && layers.interactive[y][x] === 0) {
            return { x, y };
        }

    }
}

function addPlayer(id) {
    const spawn = getSpawn();

    players[id] = {
        id,
        x: spawn.x,
        y: spawn.y,
        hp: 100,

        input: {},
        lastInput: 0,
        lastShot: 0,

        weapon: "pistol",
        ammoInMag: 12,
        lastProcessedInput: 0,// Ultima vez que processou um input
        espectador: false
    };
}

function removePlayer(id) {
    delete players[id];
}

module.exports = {
    players,
    addPlayer,
    removePlayer
};