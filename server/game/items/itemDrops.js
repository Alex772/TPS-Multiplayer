const { spawnDroppedItem } = require('./worldItems');

function dropWeaponState(player, slot, x, y) {
  const weaponState = player?.loadout?.[slot];
  if (!weaponState?.weaponId) return;

  spawnDroppedItem(`weapon_${weaponState.weaponId}`, x, y, 1, 12000, 500, {
    ammoInMag: Number(weaponState.ammoInMag || 0),
    magsLeft: Number(weaponState.magsLeft || 0),
  });
}

function dropVestState(player, x, y) {
  const vest = player?.inventory?.vest;
  if (!vest?.id || Number(vest.durability || 0) <= 0) return;

  spawnDroppedItem(vest.id, x, y, 1, 12000, 500, {
    durability: Number(vest.durability || 0),
    maxDurability: Number(vest.maxDurability || 0),
    absorption: Number(vest.absorption || 0),
  });
}

function dropPlayerItems(player) {
  if (!player) return;
  const { x, y } = player;

  dropWeaponState(player, 'primary', x + 0.35, y);
  dropWeaponState(player, 'secondary', x - 0.35, y);
  dropVestState(player, x, y - 0.28);

  const scopeZoom = Number(player.inventory?.scope || 0);
  if (scopeZoom > 1) {
    spawnDroppedItem(`scope_${scopeZoom}x`, x - 0.18, y + 0.2, 1, 12000, 500);
  }

  const meds = Math.max(0, Number(player.inventory?.meds || 0));
  for (let i = 0; i < meds; i++) {
    spawnDroppedItem('medkit', x + (i * 0.12), y + 0.35, 1, 12000, 500);
  }

  const bandages = Math.max(0, Number(player.inventory?.bandages || 0));
  for (let i = 0; i < bandages; i++) {
    spawnDroppedItem('bandage', x - (i * 0.12), y + 0.35, 1, 12000, 500);
  }
}

module.exports = { dropPlayerItems };
