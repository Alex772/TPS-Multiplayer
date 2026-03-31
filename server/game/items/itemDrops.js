const { spawnDroppedItem } = require('./worldItems');

function dropPlayerItems(player) {
  if (!player) return;
  const { x, y } = player;

  if (player.loadout?.primary?.weaponId && player.loadout.primary.weaponId !== 'rifle') {
    spawnDroppedItem(`weapon_${player.loadout.primary.weaponId}`, x + 0.35, y, 1, 12000);
  }

  const scopeZoom = Number(player.inventory?.scope || 0);
  if (scopeZoom > 1) {
    spawnDroppedItem(`scope_${scopeZoom}x`, x - 0.18, y + 0.2, 1, 12000);
  }

  if ((player.inventory?.meds || 0) > 0) {
    spawnDroppedItem('medkit', x, y + 0.35, 1, 12000);
  }
}

module.exports = { dropPlayerItems };
