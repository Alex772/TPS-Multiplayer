//client\game\input.js
import { socket, getMyPlayer } from "./network.js";
import { moveWithCollision } from "./collision.js";

// 🔥 IMPORTANTE: esse valor DEVE ser igual ao do servidor
const SPEED = 0.05;

// ============================
// SISTEMA DE INPUT (CLIENT-SIDE PREDICTION)
// ============================

// sequência dos inputs (usado na reconciliação)
let inputSeq = 0;

// fila de inputs ainda não confirmados pelo servidor
const pendingInputs = [];

// ============================
// 🔥 NOVO: ID LOCAL DAS BALAS
// ============================

// contador local (único por cliente)
let bulletSeq = 0;

// gera ID único da bala
function generateBulletId() {
    return `${window.myId}-${bulletSeq++}`;
}

// ============================
// MOVIMENTO LOCAL (PREDIÇÃO)
// ============================
export function applyLocalMovement() {
    const p = getMyPlayer();
    if (!p) return;

    let dx = 0;
    let dy = 0;

    // leitura do input atual
    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;

    // normalização (evita andar mais rápido na diagonal)
    const len = Math.hypot(dx, dy);
    if (len > 0) {
        dx /= len;
        dy /= len;
    }

    // 🔥 predição local (mesma lógica do servidor)
    if (p.hp > 0) {
        moveWithCollision(p, dx * SPEED, dy * SPEED);
    } else {
        // modo fantasma (sem colisão)
        p.x += dx * SPEED;
        p.y += dy * SPEED;
    }
}

// ============================
// ESTADO DAS TECLAS
// ============================

const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// ============================
// INPUT TECLADO (ROBUSTO)
// ============================

window.addEventListener("keydown", (e) => {
    if (e.repeat) return;

    switch (e.key.toLowerCase()) {
        case "w": keys.w = true; break;
        case "s": keys.s = true; break;
        case "a": keys.a = true; break;
        case "d": keys.d = true; break;
        case "r":
            console.log("🔄 pedido de reload");
            socket.emit("reload");
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.key.toLowerCase()) {
        case "w": keys.w = false; break;
        case "s": keys.s = false; break;
        case "a": keys.a = false; break;
        case "d": keys.d = false; break;
    }
});

// ============================
// 🔫 TIRO (AGORA COM ID)
// ============================

window.addEventListener("mousedown", (e) => {
    const p = getMyPlayer();
    if (!p || p.hp <= 0) return;

    const rect = document.getElementById("game").getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 🔥 usa centro da tela como referência (camera)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    let dx = mouseX - centerX;
    let dy = mouseY - centerY;

    const len = Math.hypot(dx, dy);
    if (len > 0) {
        dx /= len;
        dy /= len;
    }

    // 🔥 NOVO: ID da bala
    const bulletId = generateBulletId();

    socket.emit("shoot", {
        id: bulletId,            // 🔥 ESSENCIAL (novo)
        dx,
        dy,
        time: Date.now(),        // 🔥 compensação de lag
        ping: window.myPing || 0 // 🔥 compensação de lag
    });
});

// ============================
// ENVIO DE INPUT (20Hz)
// ============================

setInterval(() => {

    const input = {
        seq: inputSeq++,   // 🔥 ID único do input
        up: keys.w,
        down: keys.s,
        left: keys.a,
        right: keys.d
    };

    // guarda para reconciliação
    pendingInputs.push(input);

    // 🔥 evita crescer infinito (muito importante)
    if (pendingInputs.length > 100) {
        pendingInputs.shift();
    }

    // envia para o servidor
    socket.emit("input", input);

}, 50); // 20x por segundo

// ============================
// UTIL (USADO NO NETWORK)
// ============================

export function getPendingInputs() {
    return pendingInputs;
}