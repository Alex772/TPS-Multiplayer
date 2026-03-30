// server/game/weapons.js

const weaponsData = require("../database/weapons.json");

// ============================
// ⚖️ PESO DA ARMA
// ============================

function getWeight(w) {
    if (w.fireMode === "auto" && w.magSize > 30) return 2.5;
    if (w.damage > 50) return 2.2; // sniper
    if (w.spread > 0.1) return 2.0; // shotgun
    return 1.0; // pistola / armas leves
}

// ============================
// 🔧 NORMALIZAÇÃO
// ============================

function normalizeWeapon(id, w) {
    const recoilValue = Number(w.recoil ?? 0.01);
    const spreadValue = Number(w.spread ?? 0.01);

    return {
        // id interno da arma
        id,

        // dados originais
        ...w,

        // defaults importantes
        name: w.name ?? id,
        fireMode: w.fireMode ?? "semi",

        damage: Number(w.damage ?? 10),
        range: Number(w.range ?? 20),

        fireRate: Number(w.fireRate ?? 300),
        reloadTime: Number(w.reloadTime ?? 1200),

        magSize: Number(w.magSize ?? 12),
        reserveMags: Number(w.reserveMags ?? 3),

        spread: spreadValue,
        bulletSpeed: Number(w.bulletSpeed ?? 0.2),
        pellets: Number(w.pellets ?? 1),

        // 🔥 RECOIL AVANÇADO
        recoil: {
            perShot: recoilValue,
            max: w.recoil?.max ?? recoilValue * 100,
            recovery: w.recoil?.recovery ?? recoilValue * 0.5
        },

        // 🔥 MULTIPLICADOR DE SPREAD
        recoilSpreadMultiplier:
            Number(w.recoilSpreadMultiplier ?? spreadValue * 2),

        // ⚖️ MANUSEIO
        handling: {
            weight: Number(w.handling?.weight ?? getWeight(w)),
            swapTime: Number(w.handling?.swapTime ?? 200)
        },

        // 👁️ VISÃO (FUTURO)
        vision: {
            baseRadius: Number(w.vision?.baseRadius ?? 300),
            forwardBonus: Number(w.vision?.forwardBonus ?? 200),
            adsBonus: Number(w.vision?.adsBonus ?? 0),
            adsZoom: Number(w.vision?.adsZoom ?? 1)
        },

        // 🔭 MIRA (FUTURO)
        scope: {
            enabled: Boolean(w.scope?.enabled ?? false),
            zoom: Number(w.scope?.zoom ?? 1),
            rangeBonus: Number(w.scope?.rangeBonus ?? 0),
            reducePeripheral: Boolean(w.scope?.reducePeripheral ?? false)
        }
    };
}

// ============================
// 🧠 CACHE NORMALIZADO
// ============================

const normalizedWeapons = {};

for (let id in weaponsData) {
    normalizedWeapons[id] = normalizeWeapon(id, weaponsData[id]);
}

// garante fallback mínimo
if (!normalizedWeapons.pistol) {
    throw new Error('weapons.json precisa ter ao menos a arma "pistol"');
}

// ============================
// 🔍 GET WEAPON
// ============================

function getWeapon(id) {
    return normalizedWeapons[id] || normalizedWeapons.pistol;
}

// ============================
// 📦 EXPORT
// ============================

module.exports = {
    getWeapon,
    weapons: normalizedWeapons
};