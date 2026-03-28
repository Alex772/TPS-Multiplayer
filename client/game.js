function loop() {

    // 🔥 espera dados do servidor
    if (!window.state || !window.myId) {
        requestAnimationFrame(loop);
        return;
    }

    render(window.state, window.myId);

    requestAnimationFrame(loop);
}

loop();

// tiro
document.addEventListener("click", (e) => {
    if (window.state.players[window.myId].spectador) {
        return; // retorna sem atirar se o jogador estiver morto
    }
    let dx = e.clientX - window.innerWidth / 2;
    let dy = e.clientY - window.innerHeight / 2;

    let len = Math.sqrt(dx*dx + dy*dy);
    dx /= len;
    dy /= len;

    socket.emit("shoot", { dx, dy });
});