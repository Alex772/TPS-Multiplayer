// server/server.js

const { Server } = require("socket.io");

const io = new Server(3000, {
    cors: { origin: "*" }
});

const {
    players,
    addPlayer,
    removePlayer,
    getCurrentWeapon,
    switchWeapon
} = require("./game/players");

const { handleShoot, bullets } = require("./game/bullets");
const { gameLoop } = require("./game/gameLoop");
const { layers } = require("./game/map");
const { getWeapon } = require("./game/weapons");

// ============================
// CONEXÕES
// ============================

io.on("connection", (socket) => {
    console.log("🟢 Player conectou:", socket.id);

    addPlayer(socket.id);

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
    // TIRO
    // =========================
    socket.on("shoot", (data) => {
        const player = players[socket.id];
        if (!player || player.hp <= 0) return;
        if (player.espectador) return;

        let dx = Number(data?.dx);
        let dy = Number(data?.dy);

        if (!isFinite(dx) || !isFinite(dy)) return;

        const len = Math.hypot(dx, dy);
        if (len <= 0) return;

        dx /= len;
        dy /= len;

        const shotTime = Number(data?.time);
        const ping = Number(data?.ping) || 0;

        if (!isFinite(shotTime)) return;

        handleShoot(socket.id, {
            dx,
            dy,
            time: shotTime,
            ping
        });
    });

    // =========================
    // RELOAD
    // =========================
    socket.on("reload", () => {
        const p = players[socket.id];
        if (!p) return;
        if (p.hp <= 0) return;
        if (p.espectador) return;
        if (p.isSwitching) return;

        const weaponState = getCurrentWeapon(p);
        if (!weaponState) return;

        const weapon = getWeapon(weaponState.weaponId);
        if (!weapon) return;

        if (weaponState.isReloading) return;
        if (weaponState.magsLeft <= 0) return;
        if (weaponState.ammoInMag >= weapon.magSize) return;

        weaponState.isReloading = true;
        weaponState.reloadEndTime = Date.now() + weapon.reloadTime;

        console.log(`🔄 ${socket.id} recarregando ${weaponState.weaponId}...`);
    });

    // =========================
    // TROCA DE ARMA
    // =========================
    socket.on("switchWeapon", (data) => {
        const p = players[socket.id];
        if (!p) return;
        if (p.hp <= 0) return;
        if (p.espectador) return;

        const slot = data?.slot;

        if (slot !== "primary" && slot !== "secondary") return;

        switchWeapon(p, slot);
    });

    // =========================
    // PING
    // =========================
    socket.on("pingCheck", (time) => {
        socket.emit("pongCheck", time);
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
// STATE
// ============================

function buildState() {
    const playersToSend = {};

    for (let id in players) {
        const p = players[id];

        playersToSend[id] = {
            ...p,
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