const { players } = require("./players");
const { ITEMS } = require("./items");

function handleReload(id) {
    const p = players[id];
    if (!p) return;

    const weapon = ITEMS[p.weapon];
    if (!weapon) return;

    const ammoType = weapon.ammoType;

    const available = p.ammo[ammoType] || 0;

    const needed = weapon.maxAmmo - p.ammoInMag;

    const toReload = Math.min(needed, available);

    if (toReload <= 0) return;

    p.ammoInMag += toReload;
    p.ammo[ammoType] -= toReload;
}

module.exports = { handleReload };