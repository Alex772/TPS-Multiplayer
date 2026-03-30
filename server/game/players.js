// server/game/players.js

const { layers } = require("./map");
const { getWeapon } = require("./weapons");

const players = {};

// ============================
// 📍 SPAWN
// ============================

function getSpawn() {
    while (true) {
        const x = Math.floor(Math.random() * layers.collision[0].length);
        const y = Math.floor(Math.random() * layers.collision.length);

        if (layers.collision[y][x] === 0 && layers.interactive[y][x] === 0) {
            return { x, y };
        }
    }
}

// ============================
// 🔫 CRIAR INSTÂNCIA DE ARMA
// ============================

function createWeaponInstance(weaponId) {
    const base = getWeapon(weaponId);

    return {
        weaponId: base?.id || weaponId,

        ammoInMag: base.magSize,
        magsLeft: base.reserveMags,

        recoilCurrent: 0,

        isReloading: false,
        reloadEndTime: 0
    };
}

// ============================
// 🔍 GET ARMA ATUAL
// ============================

function getCurrentWeapon(player) {
    if (!player || !player.loadout) return null;

    const currentSlot = player.loadout.current;
    if (!currentSlot) return null;

    return player.loadout[currentSlot] || null;
}

// ============================
// 👤 ADD PLAYER
// ============================

function addPlayer(id) {
    const spawn = getSpawn();

    players[id] = {
        id,

        x: spawn.x,
        y: spawn.y,

        hp: 100,

        // 🎮 INPUT
        input: {},
        lastInput: 0,
        lastProcessedInput: 0,

        // 🔫 COMBATE
        lastShot: 0,
        hit: false,

        // 🔫 LOADOUT
        loadout: {
            primary: createWeaponInstance("rifle"),
            secondary: createWeaponInstance("pistol"),
            current: "primary"
        },

        // 🔄 ESTADOS
        isSwitching: false,
        switchEndTime: 0,
        nextWeapon: null,

        espectador: false
    };
}

// ============================
// 🔄 TROCAR ARMA
// ============================

function switchWeapon(player, target) {
    if (!player || !player.loadout) return;
    if (player.isSwitching) return;

    if (target !== "primary" && target !== "secondary") return;
    if (!player.loadout[target]) return;
    if (player.loadout.current === target) return;

    const currentWeaponState = getCurrentWeapon(player);
    if (!currentWeaponState) return;

    const current = getWeapon(currentWeaponState.weaponId);
    const next = getWeapon(player.loadout[target].weaponId);

    if (!current || !next) return;

    // 🔥 tempo de troca baseado em peso/manuseio
    const swapTime =
        current.handling.swapTime +
        (current.handling.weight + next.handling.weight) * 100;

    player.isSwitching = true;
    player.switchEndTime = Date.now() + swapTime;
    player.nextWeapon = target;

    // ❌ cancela reload da arma atual
    currentWeaponState.isReloading = false;
    currentWeaponState.reloadEndTime = 0;
}

// ============================
// ❌ REMOVER PLAYER
// ============================

function removePlayer(id) {
    delete players[id];
}

// ============================
// 📦 EXPORT
// ============================

module.exports = {
    players,
    addPlayer,
    removePlayer,
    getCurrentWeapon,
    switchWeapon,
    createWeaponInstance
};