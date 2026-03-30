import { socket, getMyPlayer, getCurrentWeapon } from "./network.js";
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
// ESTADO DAS TECLAS
// ============================

const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// ============================
// ESTADO DO MOUSE / COMBATE
// ============================

const mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    down: false
};

// usado para troca por scroll
let lastScrollSwitch = 0;
const SCROLL_SWITCH_COOLDOWN = 120;

// ============================
// MOVIMENTO LOCAL (PREDIÇÃO)
// ============================

export function applyLocalMovement() {
    const p = getMyPlayer();
    if (!p) return;

    let dx = 0;
    let dy = 0;

    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;

    // normalização (evita diagonal mais rápida)
    const len = Math.hypot(dx, dy);
    if (len > 0) {
        dx /= len;
        dy /= len;
    }

    // predição local
    if (p.hp > 0) {
        moveWithCollision(p, dx * SPEED, dy * SPEED);
    } else {
        // modo fantasma
        p.x += dx * SPEED;
        p.y += dy * SPEED;
    }
}

// ============================
// UTIL DE MIRA
// ============================

function getAimDirection() {
    const rect = document.getElementById("game").getBoundingClientRect();

    const mouseX = mouse.x - rect.left;
    const mouseY = mouse.y - rect.top;

    // referência da câmera no centro da tela
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    let dx = mouseX - centerX;
    let dy = mouseY - centerY;

    const len = Math.hypot(dx, dy);
    if (len <= 0) return null;

    dx /= len;
    dy /= len;

    return { dx, dy };
}

function canUseCombatInput() {
    const p = getMyPlayer();
    if (!p) return false;
    if (p.hp <= 0) return false;
    if (p.espectador) return false;
    return true;
}

// ============================
// TIRO
// ============================

function shootOnce() {
    if (!canUseCombatInput()) return;

    const p = getMyPlayer();
    const weapon = getCurrentWeapon();

    if (!p || !weapon) return;
    if (p.isSwitching) return;
    if (weapon.isReloading) return;
    if (weapon.ammoInMag <= 0) return;

    const aim = getAimDirection();
    if (!aim) return;

    socket.emit("shoot", {
        dx: aim.dx,
        dy: aim.dy,
        time: Date.now(),
        ping: window.myPing || 0
    });
}

// ============================
// TROCA DE ARMA
// ============================

function switchTo(slot) {
    const p = getMyPlayer();
    if (!p || !p.loadout) return;

    if (p.isSwitching) return;
    if (p.loadout.current === slot) return;
    if (!p.loadout[slot]) return;

    socket.emit("switchWeapon", { slot });
}

function switchByToggle() {
    const p = getMyPlayer();
    if (!p || !p.loadout) return;

    const nextSlot = p.loadout.current === "primary" ? "secondary" : "primary";
    switchTo(nextSlot);
}

// ============================
// RELOAD
// ============================

function requestReload() {
    if (!canUseCombatInput()) return;

    const weapon = getCurrentWeapon();
    if (!weapon) return;

    if (weapon.isReloading) return;
    if (weapon.magsLeft <= 0) return;

    socket.emit("reload");
}

// ============================
// INPUT TECLADO
// ============================

window.addEventListener("keydown", (e) => {
    if (e.repeat) return;

    switch (e.key.toLowerCase()) {
        case "w":
            keys.w = true;
            break;
        case "s":
            keys.s = true;
            break;
        case "a":
            keys.a = true;
            break;
        case "d":
            keys.d = true;
            break;

        // reload manual
        case "r":
            requestReload();
            break;

        // toggle entre primary/secondary
        case "q":
            switchByToggle();
            break;

        // slots diretos
        case "1":
            switchTo("primary");
            break;
        case "2":
            switchTo("secondary");
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.key.toLowerCase()) {
        case "w":
            keys.w = false;
            break;
        case "s":
            keys.s = false;
            break;
        case "a":
            keys.a = false;
            break;
        case "d":
            keys.d = false;
            break;
    }
});

// ============================
// INPUT MOUSE
// ============================

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return; // botão esquerdo
    mouse.down = true;

    // por enquanto: clique dispara 1 vez
    // o modo auto completo fecha quando o client também conhecer fireMode
    shootOnce();
});

window.addEventListener("mouseup", (e) => {
    if (e.button !== 0) return;
    mouse.down = false;
});

window.addEventListener(
    "wheel",
    (e) => {
        const now = Date.now();
        if (now - lastScrollSwitch < SCROLL_SWITCH_COOLDOWN) return;

        lastScrollSwitch = now;

        const p = getMyPlayer();
        if (!p || !p.loadout) return;

        if (e.deltaY > 0) {
            // roda para baixo -> alterna
            switchByToggle();
        } else if (e.deltaY < 0) {
            // roda para cima -> alterna também
            switchByToggle();
        }
    },
    { passive: true }
);

// ============================
// ENVIO DE INPUT (20Hz)
// ============================

setInterval(() => {
    const input = {
        seq: inputSeq++,
        up: keys.w,
        down: keys.s,
        left: keys.a,
        right: keys.d
    };

    pendingInputs.push(input);

    if (pendingInputs.length > 100) {
        pendingInputs.shift();
    }

    socket.emit("input", input);
}, 50);

// ============================
// UTIL (USADO NO NETWORK)
// ============================

export function getPendingInputs() {
    return pendingInputs;
}