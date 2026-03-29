//client/network.js

import { getPendingInputs } from "./input.js";

export const socket = io("http://localhost:3000");

// 🔥 CONFIG GLOBAL (tem que bater com servidor)
const SPEED = 0.05;
const LERP_OTHER = 0.25;
const LERP_CORRECTION = 0.15;

// ============================
// ESTADOS
// ============================
window.myPing = 0;
// estado renderizado (suave)
window.state = {
    players: {},
    bullets: [],
    map: null
};

// estado bruto do servidor
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

    // 🔥 clone seguro
    window.state.players = structuredClone(data.players);
    window.serverState.players = structuredClone(data.players);

    window.state.bullets = [];
    window.serverState.bullets = [];

    window.state.map = data.map;
});

// ============================
// STATE UPDATE
// ============================

socket.on("state", (data) => {

    // 🔥 evita referência direta (BUG comum)
    window.serverState.players = structuredClone(data.players);
    window.serverState.bullets = data.bullets;
});

// ============================
// INTERPOLAÇÃO + RECONCILIAÇÃO
// ============================

export function interpolate() {

    const me = window.myId;
    if (!me) return;

    const pendingInputs = getPendingInputs();

    for (let id in window.serverState.players) {

        const server = window.serverState.players[id];

        // novo player
        if (!window.state.players[id]) {
            window.state.players[id] = { ...server };
            continue;
        }

        const local = window.state.players[id];

        // =========================
        // 🔥 PLAYER LOCAL
        // =========================
        if (id === me) {

            // 🔥 correção suave (evita "teleporte seco")
            local.x += (server.x - local.x) * LERP_CORRECTION;
            local.y += (server.y - local.y) * LERP_CORRECTION;

            const lastProcessed = server.lastProcessedInput ?? 0;

            // 🔥 limpa inputs antigos
            while (
                pendingInputs.length > 0 &&
                pendingInputs[0].seq <= lastProcessed
            ) {
                pendingInputs.shift();
            }

            // 🔥 reaplica inputs não confirmados
            for (let input of pendingInputs) {

                let dx = 0;
                let dy = 0;

                if (input.up) dy -= 1;
                if (input.down) dy += 1;
                if (input.left) dx -= 1;
                if (input.right) dx += 1;

                const len = Math.hypot(dx, dy);
                if (len > 0) {
                    dx /= len;
                    dy /= len;
                }

                local.x += dx * SPEED;
                local.y += dy * SPEED;
            }

        } 
        // =========================
        // OUTROS PLAYERS
        // =========================
        else {
            local.x += (server.x - local.x) * LERP_OTHER;
            local.y += (server.y - local.y) * LERP_OTHER;
        }

        // 🔥 sincroniza dados importantes
        local.hp = server.hp;
        local.angle = server.angle;
    }

    // =========================
    // FLAGS RÁPIDAS
    // =========================

    for (let id in window.serverState.players) {
        const server = window.serverState.players[id];
        const local = window.state.players[id];

        if (!local) continue;

        local.hit = server.hit;
    }

    // =========================
    // REMOVER PLAYERS
    // =========================

    for (let id in window.state.players) {
        if (!window.serverState.players[id]) {
            delete window.state.players[id];
        }
    }

    // =========================
    // BALAS
    // =========================

    // 🔥 (simples por enquanto, depois pode interpolar)
    window.state.bullets = window.serverState.bullets;
}

// ============================
// UTIL
// ============================

export function getMyPlayer() {
    if (!window.state || !window.myId) return null;
    return window.state.players[window.myId];
}



setInterval(() => {
    socket.emit("pingCheck", Date.now());
}, 1000);

let lastPing = 0;

socket.on("pongCheck", (start) => {
    const ping = Date.now() - start;

    // 🔥 suavização simples
    window.myPing = lastPing * 0.7 + ping * 0.3;
    lastPing = window.myPing;
});