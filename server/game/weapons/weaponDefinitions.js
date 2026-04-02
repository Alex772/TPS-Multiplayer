const weaponsData = require('../../database/weapons.json');

function normalizeWeapon(id, w) {
  const recoilValue = Number(w.recoil ?? 0.01);
  const spreadValue = Number(w.spread ?? 0.01);
  const vision = w.vision || {};
  const hip = vision.hip || {};
  const ads = vision.ads || {};

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
      recovery: Number(w.recoil?.recovery ?? recoilValue * 7.5),
    },
    recoilSpreadMultiplier: Number(w.recoilSpreadMultiplier ?? 1.15),
    handling: {
      weight: Number(w.handling?.weight ?? 1),
      swapTime: Number(w.handling?.swapTime ?? 200),
    },
    vision: {
      hip: {
        range: Number(hip.range ?? 12.0),
        coneAngle: Number(hip.coneAngle ?? 90),
        peripheralRadius: Number(hip.peripheralRadius ?? 5.0),
      },
      ads: {
        baseRange: Number(ads.baseRange ?? 18.0),
        baseConeAngle: Number(ads.baseConeAngle ?? 24),
        peripheralRadius: Number(ads.peripheralRadius ?? 1.5),
        spreadMultiplier: Number(ads.spreadMultiplier ?? 0.85),
        recoilMultiplier: Number(ads.recoilMultiplier ?? 0.88),
      },
    },
    damageFalloff: {
      startRatio: Number(w.damageFalloff?.startRatio ?? 0.45),
      minMultiplier: Number(w.damageFalloff?.minMultiplier ?? 0.72),
    },
  };
}

const weapons = {};
for (const [id, def] of Object.entries(weaponsData)) {
  weapons[id] = normalizeWeapon(id, def);
}

module.exports = { weapons, normalizeWeapon };
