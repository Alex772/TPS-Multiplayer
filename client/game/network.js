import { getPendingInputs } from "./input.js";

export const socket = io("http://localhost:3000");

// ============================
// CONFIG GLOBAL
// ============================

const SPEED = 0.05;
const LERP_OTHER = 0.25;
const LERP_CORRECTION = 0.15;
const LERP_BULLET = 0.35;

// ============================
// ESTADOS GLOBAIS
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

    // players completos vindos do servidor
    window.state.players = structuredClone(data.players);
    window.serverState.players = structuredClone(data.players);

    // balas começam vazias
    window.state.bullets = [];
    window.serverState.bullets = [];

    // mapa
    window.state.map = data.map;
});

// ============================
// STATE UPDATE
// ============================

socket.on("state", (data) => {
    // clone seguro dos players
    window.serverState.players = structuredClone(data.players);

    // clone seguro das balas
    window.serverState.bullets = Array.isArray(data.bullets)
        ? data.bullets.map((b) => ({
              id: b.id,
              x: b.x,
              y: b.y,
              dx: b.dx,
              dy: b.dy
          }))
        : [];
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

        // novo player
        if (!window.state.players[id]) {
            window.state.players[id] = structuredClone(server);
            continue;
        }

        const local = window.state.players[id];

        // =========================
        // PLAYER LOCAL
        // =========================
        if (id === me) {
            // correção suave da posição
            local.x += (server.x - local.x) * LERP_CORRECTION;
            local.y += (server.y - local.y) * LERP_CORRECTION;

            const lastProcessed = server.lastProcessedInput ?? 0;

            // remove inputs já confirmados pelo servidor
            while (
                pendingInputs.length > 0 &&
                pendingInputs[0].seq <= lastProcessed
            ) {
                pendingInputs.shift();
            }

            // reaplica inputs pendentes
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

        // =========================
        // DADOS IMPORTANTES DE COMBATE
        // =========================

        local.hp = server.hp;
        local.hit = server.hit;
        local.angle = server.angle;
        local.espectador = server.espectador;

        // loadout completo
        local.loadout = structuredClone(server.loadout);

        // estados gerais
        local.isSwitching = server.isSwitching;
        local.switchEndTime = server.switchEndTime;
        local.nextWeapon = server.nextWeapon ?? null;

        // mantemos também lastShot se quiser usar depois
        local.lastShot = server.lastShot;
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

    const serverBullets = window.serverState.bullets;
    const localBullets = window.state.bullets;

    const localMap = new Map();

    for (let b of localBullets) {
        if (b && b.id !== undefined) {
            localMap.set(b.id, b);
        }
    }

    const newBullets = [];

    for (let sb of serverBullets) {
        if (!sb || sb.id === undefined) {
            newBullets.push({ ...sb });
            continue;
        }

        const lb = localMap.get(sb.id);

        // bala nova
        if (!lb) {
            newBullets.push({ ...sb });
            continue;
        }

        // bala existente -> interpola
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

export function getCurrentWeapon() {
    const p = getMyPlayer();
    if (!p || !p.loadout) return null;

    const currentSlot = p.loadout.current;
    return p.loadout[currentSlot] || null;
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