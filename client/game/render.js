const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ========================
// AJUSTE DE TELA
// ========================

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ========================
// HELPERS
// ========================

function getCurrentWeaponState(player) {
    if (!player || !player.loadout) return null;

    const currentSlot = player.loadout.current;
    if (!currentSlot) return null;

    return player.loadout[currentSlot] || null;
}

function formatWeaponName(weaponId) {
    if (!weaponId) return "Sem arma";

    switch (weaponId) {
        case "pistol": return "Pistol";
        case "rifle": return "Rifle";
        case "smg": return "SMG";
        case "shotgun": return "Shotgun";
        case "sniper": return "Sniper";
        default: return weaponId;
    }
}

export function render(state, myId) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const me = state.players[myId];
    if (!me) return;

    const camX = me.x;
    const camY = me.y;

    // ========================
    // MAPA
    // ========================

    if (!state.map || typeof state.map !== "object") return;

    const TILE_SIZE = 50;
    const layerNames = ["collision", "items", "interactive"];

    layerNames.forEach((layerName) => {
        const layer = state.map[layerName];
        if (!Array.isArray(layer)) return;

        for (let y = 0; y < layer.length; y++) {
            if (!Array.isArray(layer[y])) continue;

            for (let x = 0; x < layer[y].length; x++) {
                const tile = layer[y][x];
                if (tile === 0) continue;

                const drawX = (x - camX) * TILE_SIZE + canvas.width / 2;
                const drawY = (y - camY) * TILE_SIZE + canvas.height / 2;

                switch (tile) {
                    case 1:
                        ctx.fillStyle = "#555";
                        break; // WALL
                    case 2:
                        ctx.fillStyle = "#8B4513";
                        break; // BARREL
                    case 3:
                        ctx.fillStyle = "#4682B4";
                        break; // CAR
                    case 4:
                        ctx.fillStyle = "#FFD700";
                        break; // GUN
                    case 5:
                        ctx.fillStyle = "#FF8C00";
                        break; // AMMO
                    default:
                        ctx.fillStyle = "magenta";
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
        const p = state.players[id];

        const x = (p.x - camX) * TILE_SIZE + canvas.width / 2;
        const y = (p.y - camY) * TILE_SIZE + canvas.height / 2;

        ctx.fillStyle = id === myId ? "blue" : "red";

        const size = 10;

        if (p.hp <= 0 || p.espectador) {
            ctx.globalAlpha = 0.5;
        }

        ctx.fillRect(
            x - size / 2,
            y - size / 2,
            size,
            size
        );

        ctx.globalAlpha = 1;

        // barra de HP simples
        const barWidth = 24;
        const barHeight = 4;
        const hpRatio = Math.max(0, Math.min(1, (p.hp ?? 0) / 100));

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(x - barWidth / 2, y - 16, barWidth, barHeight);

        ctx.fillStyle = hpRatio > 0.5 ? "#32CD32" : hpRatio > 0.25 ? "#FFD700" : "#FF4D4D";
        ctx.fillRect(x - barWidth / 2, y - 16, barWidth * hpRatio, barHeight);
    }

    // ========================
    // BULLETS
    // ========================

    if (Array.isArray(state.bullets)) {
        for (let b of state.bullets) {
            let x = (b.x - camX) * TILE_SIZE + canvas.width / 2;
            let y = (b.y - camY) * TILE_SIZE + canvas.height / 2;

            // offset visual
            if (b.dx !== undefined && b.dy !== undefined) {
                const offset = 6;
                x += b.dx * offset;
                y += b.dy * offset;
            }

            // trail simples
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = "orange";
            ctx.fillRect(x - 2, y - 2, 6, 6);

            // bala
            ctx.globalAlpha = 1;
            ctx.fillStyle = "red";
            ctx.fillRect(x, y, 4, 4);
        }
    }

    // ========================
    // HITMARKER
    // ========================

    if (me.hit) {
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

        // efeito visual local rápido
        me.hit = false;
    }

    // ========================
    // CROSSHAIR
    // ========================

    {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.9;

        ctx.beginPath();
        ctx.moveTo(cx - 8, cy);
        ctx.lineTo(cx - 2, cy);

        ctx.moveTo(cx + 2, cy);
        ctx.lineTo(cx + 8, cy);

        ctx.moveTo(cx, cy - 8);
        ctx.lineTo(cx, cy - 2);

        ctx.moveTo(cx, cy + 2);
        ctx.lineTo(cx, cy + 8);
        ctx.stroke();

        ctx.globalAlpha = 1;
    }

    // ========================
    // HUD
    // ========================

    const currentWeapon = getCurrentWeaponState(me);
    const primary = me.loadout?.primary || null;
    const secondary = me.loadout?.secondary || null;

    const weaponName = formatWeaponName(currentWeapon?.weaponId);
    const ammo = currentWeapon?.ammoInMag ?? 0;
    const magsLeft = currentWeapon?.magsLeft ?? 0;

    const isReloading = !!currentWeapon?.isReloading;
    const isSwitching = !!me.isSwitching;
    const currentSlot = me.loadout?.current || "primary";

    let statusText = "";
    if (isSwitching) {
        statusText = "TROCANDO";
    } else if (isReloading) {
        statusText = "RECARREGANDO";
    }

    // fundo do HUD
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(14, canvas.height - 112, 310, 92);

    // texto principal
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.fillText(`Arma: ${weaponName}`, 24, canvas.height - 82);

    ctx.font = "16px Arial";
    ctx.fillText(`Munição: ${ammo}`, 24, canvas.height - 56);
    ctx.fillText(`Pentes: ${magsLeft}`, 24, canvas.height - 34);

    // slot atual
    ctx.fillText(
        `Slot: ${currentSlot === "primary" ? "Primária" : "Secundária"}`,
        170,
        canvas.height - 56
    );

    // status
    if (statusText) {
        ctx.fillStyle = isSwitching ? "#FFD700" : "#00E5FF";
        ctx.font = "bold 16px Arial";
        ctx.fillText(statusText, 170, canvas.height - 34);
    }

    // HP
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.fillText(`HP: ${Math.max(0, me.hp ?? 0)}`, 24, canvas.height - 126);

    // armas nos slots
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(canvas.width - 230, canvas.height - 100, 210, 80);

    ctx.font = "15px Arial";

    const primaryName = formatWeaponName(primary?.weaponId);
    const secondaryName = formatWeaponName(secondary?.weaponId);

    ctx.fillStyle = me.loadout?.current === "primary" ? "#FFD700" : "white";
    ctx.fillText(
        `1: ${primaryName} (${primary?.ammoInMag ?? 0}/${primary?.magsLeft ?? 0})`,
        canvas.width - 220,
        canvas.height - 68
    );

    ctx.fillStyle = me.loadout?.current === "secondary" ? "#FFD700" : "white";
    ctx.fillText(
        `2: ${secondaryName} (${secondary?.ammoInMag ?? 0}/${secondary?.magsLeft ?? 0})`,
        canvas.width - 220,
        canvas.height - 40
    );

    // ========================
    // STATUS DE MORTE / ESPECTADOR
    // ========================

    if (me.hp <= 0 || me.espectador) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(canvas.width / 2 - 160, 30, 320, 50);

        ctx.fillStyle = "#FF6666";
        ctx.font = "bold 24px Arial";
        ctx.fillText("VOCÊ ESTÁ FORA DE COMBATE", canvas.width / 2 - 145, 62);
    }
}