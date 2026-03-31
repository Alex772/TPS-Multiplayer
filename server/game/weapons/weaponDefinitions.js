const weaponsData = require('../../database/weapons.json');

function normalizeWeapon(id, w) {
  const recoilValue = Number(w.recoil ?? 0.01);
  const spreadValue = Number(w.spread ?? 0.01);
  const vision = w.vision || {};
  return {
    id,
    name: w.name || id,
    fireMode: w.fireMode || 'semi',
    damage: Number(w.damage ?? 10),
    range: Number(w.range ?? 20),
    fireRate: Number(w.fireRate ?? 300),
    reloadTime: Number(w.reloadTime ?? 1200),
    magSize: Number(w.magSize ?? 12),
    reserveMags: Number(w.reserveMags ?? 3),
    spread: spreadValue,
    bulletSpeed: Number(w.bulletSpeed ?? 0.2),
    pellets: Number(w.pellets ?? 1),
    recoil: {
      perShot: recoilValue,
      max: Number(w.recoil?.max ?? recoilValue * 40),
      recovery: Number(w.recoil?.recovery ?? recoilValue * 0.5),
    },
    recoilSpreadMultiplier: Number(w.recoilSpreadMultiplier ?? spreadValue * 2),
    handling: {
      weight: Number(w.handling?.weight ?? 1),
      swapTime: Number(w.handling?.swapTime ?? 200),
    },
    vision: {
      baseRadius: Number(vision.baseRadius ?? 5.0),
      coneRange: Number(vision.coneRange ?? 12.0),
      coneAngle: Number(vision.coneAngle ?? 90),
      adsBonus: Number(vision.adsBonus ?? 1.2),
      minConeAngle: Number(vision.minConeAngle ?? 18),
    },
    scope: {
      allowed: Array.isArray(w.scope?.allowed) ? w.scope.allowed : [],
    },
  };
}

const weapons = {};
for (const [id, def] of Object.entries(weaponsData)) {
  weapons[id] = normalizeWeapon(id, def);
}

module.exports = { weapons, normalizeWeapon };
