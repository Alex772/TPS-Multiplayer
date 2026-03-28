//client\render.js
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

    // DESENHAR CAMADAS
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

                // Estilos por tipo de tile
                switch (tile) {
                    case 1: // WALL
                        ctx.fillStyle = "#555";
                        break;
                    case 2: // BARREL
                        ctx.fillStyle = "#8B4513"; // Marrom
                        break;
                    case 3: // CAR
                        ctx.fillStyle = "#4682B4"; // Azul aço
                        break;
                    case 4: // ITEM_GUN
                        ctx.fillStyle = "#FFD700"; // Dourado
                        break;
                    case 5: // ITEM_AMMO
                        ctx.fillStyle = "#FF8C00"; // Laranja escuro
                        break;
                    default:
                        ctx.fillStyle = "magenta"; // Erro visual
                }

                ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
                
                // Borda para destacar tiles
                ctx.strokeStyle = "rgba(0,0,0,0.1)";
                ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
            }
        }
    });





    // players
    for (let id in state.players) {
        let p = state.players[id];

        let x = (p.x - camX) * 50 + canvas.width / 2;
        let y = (p.y - camY) * 50 + canvas.height / 2;

        ctx.fillStyle = id === myId ? "blue" : "red";
        
        const size = 10;

        // 🔥 desenha centralizado
        ctx.fillRect(
            x - size / 2,
            y - size / 2,
            size,
            size
        );
    }

    // bullets
    ctx.fillStyle = "red";

    if (Array.isArray(state.bullets)) {
        for (let b of state.bullets) {

            let x = (b.x - camX) * 50 + canvas.width / 2;
            let y = (b.y - camY) * 50 + canvas.height / 2;

            ctx.fillRect(x, y, 4, 4);
        }
    }
}


