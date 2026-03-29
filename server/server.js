//server/server.js

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

    console.log("🟢 Player conectou:", socket.id);

    addPlayer(socket.id);

    // =========================
    // INIT (ENVIO INICIAL)
    // =========================
    socket.emit("init", {
        id: socket.id,
        players: structuredClone(players),
        map: layers
    });

    // =========================
    // INPUT
    // =========================
    socket.on("input", (data) => {

        const player = players[socket.id];
        if (!player) return;

        const now = Date.now();

        // 🔥 anti flood (~60 inputs/s)
        if (now - player.lastInput < 16) return;
        player.lastInput = now;

        if (typeof data.seq !== "number") return;

        player.input = {
            seq: data.seq,
            up: !!data.up,
            down: !!data.down,
            left: !!data.left,
            right: !!data.right
        };
    });

    // =========================
    // TIRO (AGORA COM LAG COMP)
    // =========================
    socket.on("shoot", (data) => {

        const player = players[socket.id];
        if (!player || player.hp <= 0) return;

        let dx = Number(data.dx);
        let dy = Number(data.dy);

        if (!isFinite(dx) || !isFinite(dy)) return;

        const len = Math.hypot(dx, dy);
        if (len === 0) return;

        dx /= len;
        dy /= len;

        // 🔥 NOVO: valida tempo
        const shotTime = Number(data.time);
        const ping = Number(data.ping) || 0;

        if (!isFinite(shotTime)) return;

        handleShoot(socket.id, {
            dx,
            dy,
            time: shotTime,
            ping
        });
    });

    // =========================
    // PING (ESSENCIAL)
    // =========================
    socket.on("pingCheck", (time) => {
        socket.emit("pongCheck", time);
    });

    // =========================
    // RELOAD
    // =========================
    socket.on("reload", () => {

        const p = players[socket.id];
        if (!p) return;

        if (p.reloading) return;
        if (p.ammoInMag === 12) return;

        p.reloading = true;

        console.log("🔄 recarregando...");

        setTimeout(() => {
            p.ammoInMag = 12;
            p.reloading = false;

            console.log("✅ reload completo");
        }, 1500);
    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", () => {

        console.log("🔴 Player saiu:", socket.id);

        removePlayer(socket.id);

        io.emit("state", buildState());
    });
});

// ============================
// 🔥 FUNÇÃO PADRÃO DE STATE
// ============================

function buildState() {

    const playersToSend = {};

    for (let id in players) {
        const p = players[id];

        playersToSend[id] = {
            ...p,

            // 🔥 ESSENCIAL PRA RECONCILIAÇÃO
            lastProcessedInput: p.lastProcessedInput || 0
        };
    }

    return {
        players: playersToSend,
        bullets
    };
}

// ============================
// GAME LOOP
// ============================

gameLoop(io, buildState);

console.log("🚀 Servidor rodando na porta 3000");