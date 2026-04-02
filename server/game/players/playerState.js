const { getWeapon } = require('../weapons');
const { ensureActionState } = require('../actions');

const players = {};

function createWeaponInstance(weaponId) {
  const weaponDef = getWeapon(weaponId);
  return {
    weaponId: weaponDef?.id || weaponId,
    weaponDef,
    ammoInMag: weaponDef?.magSize ?? 0,
    magsLeft: weaponDef?.reserveMags ?? 0,
    recoilCurrent: 0,
    isReloading: false,
    reloadEndTime: 0,
  };
}

function hydratePlayerRuntimeState(player) {
  if (!player) return player;
  ensureActionState(player);
  return player;
}

module.exports = { players, createWeaponInstance, hydratePlayerRuntimeState };
