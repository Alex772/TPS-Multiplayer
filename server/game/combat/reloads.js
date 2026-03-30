// server/game/combat/reloads.js

const { getCurrentWeapon } = require("../players");
const { getWeapon } = require("../weapons");

function processWeaponReload(player, now) {
    const weaponState = getCurrentWeapon(player);
    if (!weaponState) return;

    const weapon = getWeapon(weaponState.weaponId);
    if (!weapon) return;

    if (!weaponState.isReloading) return;
    if (now < weaponState.reloadEndTime) return;

    // regra: descarta pente atual
    if (weaponState.magsLeft > 0) {
        weaponState.ammoInMag = weapon.magSize;
        weaponState.magsLeft--;
    }

    weaponState.isReloading = false;
    weaponState.reloadEndTime = 0;
}

module.exports = { processWeaponReload };