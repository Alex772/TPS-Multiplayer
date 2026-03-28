//client\input.js
import { socket, getMyPlayer } from "./network.js";
import { moveWithCollision } from "./collision.js";

const SPEED = 0.05;

export function applyLocalMovement() {
    const p = getMyPlayer();
    if (!p) return;

    let dx = 0;
    let dy = 0;

    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;

    const len = Math.hypot(dx, dy);
    if (len > 0) {
        dx /= len;
        dy /= len;
    }

    if (p.hp > 0) {
        // jogador vivo → aplica colisão normal
        moveWithCollision(p, dx * SPEED, dy * SPEED);
    } else {
        // jogador morto → modo fantasma: movimento livre, sem colisão
        p.x += dx * SPEED;
        p.y += dy * SPEED;
    }
}




// 🔥 estado de teclas (mais confiável)
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// ============================
// INPUT TECLADO
// ============================
window.addEventListener("keydown", (e) => {
    if (e.key === "w") keys.w = true;
    if (e.key === "s") keys.s = true;
    if (e.key === "a") keys.a = true;
    if (e.key === "d") keys.d = true;
});

window.addEventListener("keyup", (e) => {
    if (e.key === "w") keys.w = false;
    if (e.key === "s") keys.s = false;
    if (e.key === "a") keys.a = false;
    if (e.key === "d") keys.d = false;
});



// TIRO
window.addEventListener("mousedown", (e) => {
    const p = getMyPlayer();
    if (!p || p.hp <= 0) return; // 🔥 não atira se morto

    const rect = document.getElementById("game").getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    let dx = mouseX - centerX;
    let dy = mouseY - centerY;
    const len = Math.hypot(dx, dy);
    if (len > 0) {
        dx /= len;
        dy /= len;
    }

    socket.emit("shoot", { dx, dy });
});


window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r") {
        console.log("🔄 pedido de reload");
        socket.emit("reload");
    }
});

// ============================
// ENVIO PARA O SERVIDOR
// ============================
setInterval(() => {

    // 🔥 envia INTENÇÃO, não velocidade
    socket.emit("input", {
        up: keys.w,
        down: keys.s,
        left: keys.a,
        right: keys.d
    });

}, 50); // 🔥 20 vezes por segundo (ideal)