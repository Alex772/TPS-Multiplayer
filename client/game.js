//client\game.js
import { interpolate } from "./network.js";
import { applyLocalMovement } from "./input.js";
import { render } from "./render.js";

function loop() {

    if (!window.state || !window.myId) {
        requestAnimationFrame(loop);
        return;
    }

    // 🔥 1. aplica prediction
    applyLocalMovement();

    // 🔥 2. corrige com servidor
    interpolate();

    // 🔥 3. renderiza
    render(window.state, window.myId);

    requestAnimationFrame(loop);
}

loop();