// server/game/combat/weaponSwitch.js

const { getCurrentWeapon } = require("../players");

function processWeaponSwitch(player, now) {
    if (!player.isSwitching) return;
    if (now < player.switchEndTime) return;

    player.isSwitching = false;

    if (!player.nextWeapon) return;

    player.loadout.current = player.nextWeapon;
    player.nextWeapon = null;

    // reset recoil da nova arma
    const newWeapon = getCurrentWeapon(player);
    if (newWeapon) {
        newWeapon.recoilCurrent = 0;
    }
}

module.exports = { processWeaponSwitch };