const { Server } = require("socket.io");

const io = new Server(3000, {
    cors: { origin: "*" }
});

// módulos
const { players, addPlayer, removePlayer } = require("./game/players");
const { handleShoot, bullets } = require("./game/bullets");
const { gameLoop } = require("./game/gameLoop");
const { layers } = require("./game/map");

// ============================
// CONEXÕES
// ============================
io.on("connection", (socket) => {

    addPlayer(socket.id);

    socket.emit("init", {
        id: socket.id,
        players,
        map: layers
    });

    socket.on("input", (data) => {
        if (!players[socket.id]) return;

        players[socket.id].vx = data.vx;
        players[socket.id].vy = data.vy;
    });

    socket.on("shoot", (data) => {
        handleShoot(socket.id, data);
    });

    socket.on("disconnect", () => {
        removePlayer(socket.id);
    });
});

// inicia loop
gameLoop(io);

console.log("Servidor rodando na porta 3000");