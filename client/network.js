//client\network.js
const SERVER_URL = "http://localhost:3000";

export const socket = io(SERVER_URL);

// 🔥 estado LOCAL (não substituído toda hora)
window.state = {
    players: {},
    bullets: [],
    map: null
};

window.serverState = {
    players: {},
    bullets: []
};

window.myId = null;

// ============================
// CONEXÃO
// ============================
socket.on("connect", () => {
    console.log("✅ conectado no servidor");
});

// ============================
// INIT
// ============================
socket.on("init", (data) => {
    console.log("🔥 INIT RECEBIDO:", data);

    window.myId = data.id;

    // estado inicial (clonado)
    window.state.players = structuredClone(data.players);
    window.serverState.players = data.players;

    window.state.bullets = [];
    window.serverState.bullets = [];

    window.state.map = data.map;
});

// ============================
// STATE UPDATE DO SERVIDOR
// ============================
socket.on("state", (data) => {

    // 🔥 guarda estado bruto do servidor
    window.serverState.players = data.players;
    window.serverState.bullets = data.bullets;
});

// ============================
// INTERPOLAÇÃO (RODA TODO FRAME)
// ============================
export function interpolate() {
    const lerp = 0.15;
    const me = window.myId;

    for (let id in window.serverState.players) {
        const server = window.serverState.players[id];

        if (!window.state.players[id]) {
            window.state.players[id] = { ...server };
            continue;
        }

        const local = window.state.players[id];

        if (id === me) {
            // 🔥 PLAYER LOCAL → correção suave (não sobrescreve)
            local.x += (server.x - local.x) * 0.2;
            local.y += (server.y - local.y) * 0.2;
        } else {
            // outros players → normal
            local.x += (server.x - local.x) * lerp;
            local.y += (server.y - local.y) * lerp;
        }
    }

    // remover players
    for (let id in window.state.players) {
        if (!window.serverState.players[id]) {
            delete window.state.players[id];
        }
    }

    window.state.bullets = window.serverState.bullets;
}

// ============================
// UTIL
// ============================
export function getMyPlayer() {
    if (!window.state || !window.myId) return null;
    return window.state.players[window.myId];
}