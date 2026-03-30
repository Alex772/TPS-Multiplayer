//client\game\network.js
import { getPendingInputs } from "./input.js";

export const socket = io("http://localhost:3000");

// 🔥 CONFIG GLOBAL
const SPEED = 0.05;
const LERP_OTHER = 0.25;
const LERP_CORRECTION = 0.15;
const LERP_BULLET = 0.35;

// ============================
// ESTADOS
// ============================

window.myPing = 0;

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

    window.serverState.players = structuredClone(data.players);

    // 🔥 garante ID nas balas
    window.serverState.bullets = data.bullets.map(b => ({
        id: b.id, // 🔥 ESSENCIAL
        x: b.x,
        y: b.y,
        dx: b.dx,
        dy: b.dy
    }));
});

// ============================
// INTERPOLAÇÃO + RECONCILIAÇÃO
// ============================

export function interpolate() {

    const me = window.myId;
    if (!me) return;

    const pendingInputs = getPendingInputs();

    // =========================
    // PLAYERS
    // =========================

    for (let id in window.serverState.players) {

        const server = window.serverState.players[id];

        if (!window.state.players[id]) {
            window.state.players[id] = { ...server };
            continue;
        }

        const local = window.state.players[id];

        if (id === me) {

            local.x += (server.x - local.x) * LERP_CORRECTION;
            local.y += (server.y - local.y) * LERP_CORRECTION;

            const lastProcessed = server.lastProcessedInput ?? 0;

            while (
                pendingInputs.length > 0 &&
                pendingInputs[0].seq <= lastProcessed
            ) {
                pendingInputs.shift();
            }

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

        } else {

            local.x += (server.x - local.x) * LERP_OTHER;
            local.y += (server.y - local.y) * LERP_OTHER;
        }

        local.hp = server.hp;
        local.angle = server.angle;
    }

    // =========================
    // FLAGS
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
    // 🔥 INTERPOLAÇÃO DE BALAS (CORRIGIDO)
    // =========================

    const serverBullets = window.serverState.bullets;
    const localBullets = window.state.bullets;

    const localMap = new Map();

    for (let b of localBullets) {
        if (b.id !== undefined) {
            localMap.set(b.id, b);
        }
    }

    const newBullets = [];

    for (let sb of serverBullets) {

        if (sb.id === undefined) {
            // fallback seguro (evita crash)
            newBullets.push({ ...sb });
            continue;
        }

        const lb = localMap.get(sb.id);

        if (!lb) {
            newBullets.push({ ...sb });
            continue;
        }

        lb.x += (sb.x - lb.x) * LERP_BULLET;
        lb.y += (sb.y - lb.y) * LERP_BULLET;

        lb.dx = sb.dx;
        lb.dy = sb.dy;

        newBullets.push(lb);
    }

    window.state.bullets = newBullets;
}

// ============================
// UTIL
// ============================

export function getMyPlayer() {
    if (!window.state || !window.myId) return null;
    return window.state.players[window.myId];
}

// ============================
// PING
// ============================

setInterval(() => {
    socket.emit("pingCheck", Date.now());
}, 1000);

let lastPing = 0;

socket.on("pongCheck", (start) => {
    const ping = Date.now() - start;

    window.myPing = lastPing * 0.7 + ping * 0.3;
    lastPing = window.myPing;
});