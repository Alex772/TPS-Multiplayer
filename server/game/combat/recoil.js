// server/game/combat/recoil.js

const { getCurrentWeapon } = require("../players");
const { getWeapon } = require("../weapons");

function recoverWeaponRecoil(player) {
    const weaponState = getCurrentWeapon(player);
    if (!weaponState) return;

    const weapon = getWeapon(weaponState.weaponId);
    if (!weapon) return;

    // recovery é tratada como valor por segundo; convertendo para tick de ~60 FPS
    weaponState.recoilCurrent -= weapon.recoil.recovery / 60;

    if (weaponState.recoilCurrent < 0) {
        weaponState.recoilCurrent = 0;
    }
}

module.exports = { recoverWeaponRecoil };