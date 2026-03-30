// server/server.js

const { Server } = require("socket.io");

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
// SOCKET.IO
// ============================

const io = new Server(3000, {
    cors: { origin: "*" }
});

// ============================
// HELPERS
// ============================

function getPlayerOrNull(socketId) {
    return players[socketId] || null;
}

function normalizeDirection(dx, dy) {
    dx = Number(dx);
    dy = Number(dy);

    if (!isFinite(dx) || !isFinite(dy)) return null;

    const len = Math.hypot(dx, dy);
    if (len <= 0) return null;

    return {
        dx: dx / len,
        dy: dy / len
    };
}

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
// SOCKET HANDLERS
// ============================

function handleInput(socket, data) {
    const player = getPlayerOrNull(socket.id);
    if (!player) return;

    const now = Date.now();

    // anti flood (~60 inputs/s)
    if (now - player.lastInput < 16) return;
    player.lastInput = now;

    if (typeof data?.seq !== "number") return;

    player.input = {
        seq: data.seq,
        up: !!data.up,
        down: !!data.down,
        left: !!data.left,
        right: !!data.right
    };
}

function handleShootRequest(socket, data) {
    const player = getPlayerOrNull(socket.id);
    if (!player) return;
    if (player.hp <= 0) return;
    if (player.espectador) return;

    const direction = normalizeDirection(data?.dx, data?.dy);
    if (!direction) return;

    const shotTime = Number(data?.time);
    const ping = Number(data?.ping) || 0;

    if (!isFinite(shotTime)) return;

    handleShoot(socket.id, {
        dx: direction.dx,
        dy: direction.dy,
        time: shotTime,
        ping
    });
}

function handleReloadRequest(socket) {
    const player = getPlayerOrNull(socket.id);
    if (!player) return;
    if (player.hp <= 0) return;
    if (player.espectador) return;
    if (player.isSwitching) return;
    if (player.isPickingItem) return;

    const weaponState = getCurrentWeapon(player);
    if (!weaponState) return;

    const weapon = getWeapon(weaponState.weaponId);
    if (!weapon) return;

    if (weaponState.isReloading) return;
    if (weaponState.magsLeft <= 0) return;
    if (weaponState.ammoInMag >= weapon.magSize) return;

    weaponState.isReloading = true;
    weaponState.reloadEndTime = Date.now() + weapon.reloadTime;

    console.log(`🔄 ${socket.id} recarregando ${weaponState.weaponId}...`);
}

function handleSwitchWeaponRequest(socket, data) {
    const player = getPlayerOrNull(socket.id);
    if (!player) return;
    if (player.hp <= 0) return;
    if (player.espectador) return;
    if (player.isPickingItem) return;

    const slot = data?.slot;
    if (slot !== "primary" && slot !== "secondary") return;

    switchWeapon(player, slot);
}

function handlePingCheck(socket, time) {
    socket.emit("pongCheck", time);
}

function handleDisconnect(socket) {
    console.log("🔴 Player saiu:", socket.id);

    removePlayer(socket.id);

    io.emit("state", buildState());
}

// ============================
// CONNECTION
// ============================

io.on("connection", (socket) => {
    console.log("🟢 Player conectou:", socket.id);

    addPlayer(socket.id);

    socket.emit("init", {
        id: socket.id,
        players: structuredClone(players),
        map: layers
    });

    socket.on("input", (data) => handleInput(socket, data));
    socket.on("shoot", (data) => handleShootRequest(socket, data));
    socket.on("reload", () => handleReloadRequest(socket));
    socket.on("switchWeapon", (data) => handleSwitchWeaponRequest(socket, data));
    socket.on("pingCheck", (time) => handlePingCheck(socket, time));
    socket.on("disconnect", () => handleDisconnect(socket));
});

// ============================
// GAME LOOP
// ============================

gameLoop(io, buildState);

console.log("🚀 Servidor rodando na porta 3000");