// server/game/bullets.js

const { players, getCurrentWeapon } = require("./players");
const { getWeapon } = require("./weapons");
const { getSnapshotAt } = require("./snapshots");

let bullets = [];

// ============================
// 🔥 ID GLOBAL
// ============================

let bulletIdCounter = 0;

function generateBulletId() {
    return `b_${bulletIdCounter++}`;
}

// ============================
// 🔧 UTIL
// ============================

function clampRecoil(weaponState, weapon) {
    weaponState.recoilCurrent += weapon.recoil.perShot;

    if (weaponState.recoilCurrent > weapon.recoil.max) {
        weaponState.recoilCurrent = weapon.recoil.max;
    }
}

function applySpread(baseDx, baseDy, weapon, recoilCurrent) {
    let dx =
        baseDx +
        (Math.random() - 0.5) * weapon.spread +
        (Math.random() - 0.5) * recoilCurrent * weapon.recoilSpreadMultiplier;

    let dy =
        baseDy +
        (Math.random() - 0.5) * weapon.spread +
        (Math.random() - 0.5) * recoilCurrent * weapon.recoilSpreadMultiplier;

    const len = Math.hypot(dx, dy);
    if (len <= 0) return null;

    dx /= len;
    dy /= len;

    return { dx, dy };
}

function createBullet({
    owner,
    x,
    y,
    dx,
    dy,
    weapon,
    snapshotPlayers,
    shotTime
}) {
    return {
        id: generateBulletId(),

        x,
        y,

        dx,
        dy,

        // 🔥 agora usa velocidade da própria arma
        speed: weapon.bulletSpeed ?? 0.2,

        range: weapon.range,
        distanceTraveled: 0,

        owner,
        damage: weapon.damage,

        snapshotPlayers,
        shotTime
    };
}

function canShoot(player, weaponState, weapon, now) {
    if (!player) return false;
    if (player.hp <= 0) return false;
    if (player.espectador) return false;

    if (player.isSwitching) return false;
    if (weaponState.isReloading) return false;

    if (now - player.lastShot < weapon.fireRate) return false;
    if (weaponState.ammoInMag <= 0) return false;

    return true;
}

// ============================
// 🔫 HANDLE SHOOT
// ============================

function handleShoot(id, data) {
    const p = players[id];
    if (!p) return;

    const now = Date.now();

    // =========================
    // 🔫 ARMA ATUAL
    // =========================
    const weaponState = getCurrentWeapon(p);
    if (!weaponState) return;

    const weapon = getWeapon(weaponState.weaponId);
    if (!weapon) return;

    // =========================
    // ⛔ VALIDAÇÕES BÁSICAS
    // =========================

    if (!isFinite(Number(data?.dx)) || !isFinite(Number(data?.dy))) return;

    if (!canShoot(p, weaponState, weapon, now)) return;

    // =========================
    // 🧠 LAG COMPENSATION
    // =========================

    const shotTime = Number(data.time);
    const ping = Number(data.ping) || 0;

    if (!isFinite(shotTime)) return;

    const realShotTime = shotTime - (ping / 2);

    const snapshot = getSnapshotAt(realShotTime);

    let snapshotPlayers = players;
    if (snapshot && snapshot.players) {
        snapshotPlayers = snapshot.players;
    }

    // =========================
    // 🔥 FIRE MODE
    // =========================
    // Observação:
    // - com o client atual, auto/semi/manual ainda não chegam 100% distintos
    // - então aqui mantemos compatibilidade por fireRate
    // - quando o client mandar estado do gatilho, fechamos manual/semi de vez

    if (
        weapon.fireMode !== "auto" &&
        weapon.fireMode !== "semi" &&
        weapon.fireMode !== "manual"
    ) {
        return;
    }

    // =========================
    // 🔥 APLICA RECOIL
    // =========================

    clampRecoil(weaponState, weapon);

    const recoilCurrent = weaponState.recoilCurrent;

    // =========================
    // 🔫 CONSUME TIRO
    // =========================

    p.lastShot = now;
    weaponState.ammoInMag--;

    // =========================
    // 🔫 SHOTGUN / MULTI-PELLET
    // =========================

    const pelletCount = Math.max(1, Number(weapon.pellets) || 1);

    for (let i = 0; i < pelletCount; i++) {
        const spreadResult = applySpread(
            Number(data.dx),
            Number(data.dy),
            weapon,
            recoilCurrent
        );

        if (!spreadResult) continue;

        bullets.push(
            createBullet({
                owner: id,
                x: p.x,
                y: p.y,
                dx: spreadResult.dx,
                dy: spreadResult.dy,
                weapon,
                snapshotPlayers,
                shotTime: realShotTime
            })
        );
    }
}

// ============================
// 📦 EXPORT
// ============================

module.exports = {
    bullets,
    handleShoot
};