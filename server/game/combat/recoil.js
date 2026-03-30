// server/game/combat/recoil.js

const { getCurrentWeapon } = require("../players");
const { getWeapon } = require("../weapons");

function recoverWeaponRecoil(player) {
    const weaponState = getCurrentWeapon(player);
    if (!weaponState) return;

    const weapon = getWeapon(weaponState.weaponId);
    if (!weapon) return;

    weaponState.recoilCurrent -= weapon.recoil.recovery;

    if (weaponState.recoilCurrent < 0) {
        weaponState.recoilCurrent = 0;
    }
}

module.exports = { recoverWeaponRecoil };