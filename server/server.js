//server\server.js
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
        players: structuredClone(players),
        map: layers
    });

    // 🔥 atualiza todos quando alguém entra
    io.emit("state", { players, bullets });

    socket.on("input", (data) => {
        const player = players[socket.id];
        if (!player) return;

        const now = Date.now();

        if (now - player.lastInput < 16) return;
        player.lastInput = now;

        player.input = {
            up: !!data.up,
            down: !!data.down,
            left: !!data.left,
            right: !!data.right
        };
    });
    
    socket.on("shoot", (data) => {
        const player = players[socket.id];
        if (!player) return;

        const now = Date.now();

        // deixa só validação básica
        let dx = Number(data.dx);
        let dy = Number(data.dy);

        if (!isFinite(dx) || !isFinite(dy)) return;

        const len = Math.hypot(dx, dy);
        if (len === 0) return;

        dx /= len;
        dy /= len;

        // 🔥 deixa o handleShoot cuidar do fireRate
        handleShoot(socket.id, { dx, dy });

        
    });

    socket.on("disconnect", () => {
        removePlayer(socket.id);

        io.emit("state", { players, bullets });
    });
});

// inicia loop
gameLoop(io);

console.log("Servidor rodando na porta 3000");