let input = { vx: 0, vy: 0 };

window.addEventListener("keydown", e => {
    if (e.key === "w") input.vy = -1;
    if (e.key === "s") input.vy = 1;
    if (e.key === "a") input.vx = -1;
    if (e.key === "d") input.vx = 1;
});

window.addEventListener("keyup", e => {
    if (["w","s"].includes(e.key)) input.vy = 0;
    if (["a","d"].includes(e.key)) input.vx = 0;
});

setInterval(() => {
    socket.emit("input", input);
}, 1000 / 60);