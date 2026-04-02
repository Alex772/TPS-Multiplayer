// server/game/combat/reloads.js

const { getCurrentWeapon } = require('../players');
const { getWeapon } = require('../weapons');
const { startAction, clearAction } = require('../actions');

function beginWeaponReload(player, now = Date.now()) {
  const weaponState = getCurrentWeapon(player);
  if (!weaponState) return false;

  const weapon = getWeapon(weaponState.weaponId);
  if (!weapon) return false;

  if (
    weaponState.isReloading ||
    weaponState.magsLeft <= 0 ||
    weaponState.ammoInMag >= weapon.magSize
  ) {
    return false;
  }

  const started = startAction(
    player,
    'reload',
    weapon.reloadTime,
    { weaponId: weapon.id, slot: player?.loadout?.current || 'primary' },
    now
  );

  if (!started) return false;

  weaponState.isReloading = true;
  weaponState.reloadEndTime = now + weapon.reloadTime;
  return true;
}

function cancelWeaponReload(player) {
  const weaponState = getCurrentWeapon(player);
  if (weaponState) {
    weaponState.isReloading = false;
    weaponState.reloadEndTime = 0;
  }

  if (player?.action?.type === 'reload') {
    clearAction(player);
  }
}

function processWeaponReload(player, now = Date.now()) {
  const action = player?.action;
  if (!action?.locked || action.type !== 'reload') return;
  if (now < action.endAt) return;

  const weaponState = getCurrentWeapon(player);
  if (!weaponState) {
    clearAction(player);
    return;
  }

  const weapon = getWeapon(weaponState.weaponId);
  if (!weapon) {
    weaponState.isReloading = false;
    weaponState.reloadEndTime = 0;
    clearAction(player);
    return;
  }

  if (weaponState.magsLeft > 0 && weaponState.ammoInMag < weapon.magSize) {
    weaponState.ammoInMag = weapon.magSize;
    weaponState.magsLeft--;
  }

  weaponState.isReloading = false;
  weaponState.reloadEndTime = 0;
  clearAction(player);
}

module.exports = {
  beginWeaponReload,
  cancelWeaponReload,
  processWeaponReload,
};
