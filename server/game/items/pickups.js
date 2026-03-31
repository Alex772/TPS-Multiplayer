const { getItemDefinition } = require('./itemRules');
const { getVisibleWorldItems, removeWorldItem, spawnDroppedItem } = require('./worldItems');
const { createWeaponInstance } = require('../players');
const { setScopeItem, addMeds } = require('./inventory');

function canWeaponUseScope(weaponDef, zoom) {
  const allowed = weaponDef?.scope?.allowed || [];
  return allowed.includes(zoom);
}

function isSameTile(player, item) {
  const playerTileX = Math.floor(player.x);
  const playerTileY = Math.floor(player.y);
  const itemTileX = Math.floor(item.x);
  const itemTileY = Math.floor(item.y);

  return playerTileX === itemTileX && playerTileY === itemTileY;
}

function getCurrentSelectedWeaponSlot(player) {
  const currentSlot = player?.loadout?.current;

  if (currentSlot === 'secondary' && player?.loadout?.secondary) {
    return 'secondary';
  }

  if (currentSlot === 'primary' && player?.loadout?.primary) {
    return 'primary';
  }

  if (player?.loadout?.primary) return 'primary';
  if (player?.loadout?.secondary) return 'secondary';

  return 'primary';
}

function dropWeaponIfExists(player, slot) {
  const weaponState = player?.loadout?.[slot];
  if (!weaponState?.weaponId) return;

  spawnDroppedItem(
    `weapon_${weaponState.weaponId}`,
    player.x + 0.18,
    player.y - 0.12,
    1,
    12000
  );
}

function applyWeaponPickup(player, definition) {
  /**
   * Regra nova:
   * a arma do chão sempre substitui a arma do slot atualmente selecionado.
   *
   * Exemplo:
   * - se o player está com primary selecionada, troca a primary
   * - se o player está com secondary selecionada, troca a secondary
   *
   * Assim, para trocar a segunda arma, ele precisa estar com ela selecionada.
   */
  const slotToReplace = getCurrentSelectedWeaponSlot(player);

  dropWeaponIfExists(player, slotToReplace);

  player.loadout[slotToReplace] = createWeaponInstance(definition.weaponId);
  player.loadout.current = slotToReplace;

  if (player.activeScope && player.activeScope > 1) {
    const currentWeapon = player.loadout[player.loadout.current];
    if (!canWeaponUseScope(currentWeapon?.weaponDef, player.activeScope)) {
      player.activeScope = 1;
    }
  }

  return true;
}

function applyScopePickup(player, definition) {
  const zoom = Number(definition.zoom || 1);
  const previous = setScopeItem(player, zoom);

  const currentWeapon = player.loadout?.current
    ? player.loadout[player.loadout.current]
    : null;

  player.activeScope = canWeaponUseScope(currentWeapon?.weaponDef, zoom)
    ? zoom
    : 1;

  if (previous && previous > 1 && previous !== zoom) {
    spawnDroppedItem(
      `scope_${previous}x`,
      player.x + 0.18,
      player.y - 0.12,
      1,
      12000
    );
  }

  return true;
}

function applyHealPickup(player, definition) {
  addMeds(player, 1);
  player.hp = Math.min(100, player.hp + Number(definition.amount || 0));
  return true;
}

function applyAmmoPickup(player, definition) {
  const current = player.loadout?.current
    ? player.loadout[player.loadout.current]
    : null;

  if (!current) return false;

  current.magsLeft += Number(definition.mags || 1);
  return true;
}

function applyItemToPlayer(player, item) {
  const definition = getItemDefinition(item.id);
  if (!definition) return false;

  switch (definition.type) {
    case 'weapon':
      return applyWeaponPickup(player, definition);

    case 'scope':
      return applyScopePickup(player, definition);

    case 'heal':
      return applyHealPickup(player, definition);

    case 'ammo':
      return applyAmmoPickup(player, definition);

    default:
      return false;
  }
}

function tryPickupItemOnPlayerTile(player, now = Date.now()) {
  if (!player || player.hp <= 0 || player.espectador) return false;

  const items = getVisibleWorldItems(now);

  for (const item of items) {
    if (!isSameTile(player, item)) continue;

    if (applyItemToPlayer(player, item)) {
      removeWorldItem(item.worldId, now);
      return true;
    }
  }

  return false;
}

module.exports = { tryPickupItemOnPlayerTile };