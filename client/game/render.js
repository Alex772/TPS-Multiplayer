const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export function render(state, myId) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let me = state.players[myId];
    if (!me) return;

    let camX = me.x;
    let camY = me.y;

    // ========================
    // MAPA (CAMADAS)
    // ========================

    if (!state.map || typeof state.map !== "object") return;

    const TILE_SIZE = 50;

    const layerNames = ["collision", "items", "interactive"];
    
    layerNames.forEach(layerName => {
        const layer = state.map[layerName];
        if (!Array.isArray(layer)) return;

        for (let y = 0; y < layer.length; y++) {
            if (!Array.isArray(layer[y])) continue;

            for (let x = 0; x < layer[y].length; x++) {
                const tile = layer[y][x];
                if (tile === 0) continue;

                let drawX = (x - camX) * TILE_SIZE + canvas.width / 2;
                let drawY = (y - camY) * TILE_SIZE + canvas.height / 2;

                switch (tile) {
                    case 1: ctx.fillStyle = "#555"; break;       // WALL
                    case 2: ctx.fillStyle = "#8B4513"; break;    // BARREL
                    case 3: ctx.fillStyle = "#4682B4"; break;    // CAR
                    case 4: ctx.fillStyle = "#FFD700"; break;    // GUN
                    case 5: ctx.fillStyle = "#FF8C00"; break;    // AMMO
                    default: ctx.fillStyle = "magenta";
                }

                ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = "rgba(0,0,0,0.1)";
                ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
            }
        }
    });

    // ========================
    // PLAYERS
    // ========================

    for (let id in state.players) {
        let p = state.players[id];

        let x = (p.x - camX) * TILE_SIZE + canvas.width / 2;
        let y = (p.y - camY) * TILE_SIZE + canvas.height / 2;

        ctx.fillStyle = id === myId ? "blue" : "red";
        
        const size = 10;

        if (p.hp <= 0) {
            ctx.globalAlpha = 0.5;
        }

        ctx.fillRect(
            x - size / 2,
            y - size / 2,
            size,
            size
        );

        ctx.globalAlpha = 1;
    }

    // ========================
    // BULLETS (COM OFFSET VISUAL + TRAIL)
    // ========================

    if (Array.isArray(state.bullets)) {
        for (let b of state.bullets) {

            let x = (b.x - camX) * TILE_SIZE + canvas.width / 2;
            let y = (b.y - camY) * TILE_SIZE + canvas.height / 2;

            // ========================
            // 🔥 OFFSET VISUAL
            // ========================
            // se tiver direção, empurra a bala pra frente
            if (b.dx !== undefined && b.dy !== undefined) {
                const offset = 6; // distância visual
                x += b.dx * offset;
                y += b.dy * offset;
            }

            // ========================
            // 🔥 TRAIL SIMPLES
            // ========================
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = "orange";
            ctx.fillRect(x - 2, y - 2, 6, 6);

            ctx.globalAlpha = 1;

            // ========================
            // BALA PRINCIPAL
            // ========================
            ctx.fillStyle = "red";
            ctx.fillRect(x, y, 4, 4);
        }
    }

    // ========================
    // HITMARKER
    // ========================

    if (me && me.hit) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 10);
        ctx.lineTo(cx + 10, cy + 10);

        ctx.moveTo(cx + 10, cy - 10);
        ctx.lineTo(cx - 10, cy + 10);

        ctx.stroke();

        me.hit = false;
    }

    // ========================
    // HUD
    // ========================

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";

    const ammo = me.ammoInMag ?? 0;
    const reloading = me.reloading ? " (RELOAD)" : "";

    ctx.fillText(
        `Ammo: ${ammo}${reloading}`,
        20,
        canvas.height - 20
    );
}