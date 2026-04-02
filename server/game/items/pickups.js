const { getItemDefinition, getScopeDefinition } = require('./itemRules');
const { getVisibleWorldItems, removeWorldItem, spawnDroppedItem } = require('./worldItems');
const { createWeaponInstance } = require('../players');
const { setScopeItem, addMeds, addBandages, setVestItem } = require('./inventory');

function isSameTile(player, item) {
  const playerTileX = Math.floor(player.x);
  const playerTileY = Math.floor(player.y);
  const itemTileX = Math.floor(item.x);
  const itemTileY = Math.floor(item.y);

  return playerTileX === itemTileX && playerTileY === itemTileY;
}

function getCurrentSelectedWeaponSlot(player) {
  const preferredSlot = player?.isSwitching && player?.nextWeapon
    ? player.nextWeapon
    : player?.loadout?.current;

  if (preferredSlot === 'secondary' && player?.loadout?.secondary) {
    return 'secondary';
  }

  if (preferredSlot === 'primary' && player?.loadout?.primary) {
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
    12000,
    0,
    {
      ammoInMag: Number(weaponState.ammoInMag || 0),
      magsLeft: Number(weaponState.magsLeft || 0),
    }
  );
}

function dropVestIfExists(player) {
  const vest = player?.inventory?.vest;
  if (!vest?.id || Number(vest.durability || 0) <= 0) return;

  spawnDroppedItem(
    vest.id,
    player.x + 0.18,
    player.y - 0.12,
    1,
    12000,
    0,
    {
      durability: Number(vest.durability || 0),
      maxDurability: Number(vest.maxDurability || 0),
      absorption: Number(vest.absorption || 0),
    }
  );
}

function applyWeaponPickup(player, definition, item) {
  const slotToReplace = getCurrentSelectedWeaponSlot(player);

  dropWeaponIfExists(player, slotToReplace);

  const nextWeaponState = createWeaponInstance(definition.weaponId);
  const droppedState = item?.extraData || null;
  if (droppedState) {
    if (Number.isFinite(Number(droppedState.ammoInMag))) nextWeaponState.ammoInMag = Math.max(0, Number(droppedState.ammoInMag));
    if (Number.isFinite(Number(droppedState.magsLeft))) nextWeaponState.magsLeft = Math.max(0, Number(droppedState.magsLeft));
  }

  player.loadout[slotToReplace] = nextWeaponState;
  player.loadout.current = slotToReplace;

  return true;
}

function applyScopePickup(player, definition) {
  const previous = setScopeItem(player, definition.id);
  player.activeScope = player.ads ? Number(definition.zoom || 1) : 1;

  if (previous && previous !== definition.id) {
    spawnDroppedItem(
      previous,
      player.x + 0.18,
      player.y - 0.12,
      1,
      12000
    );
  }

  return true;
}

function applyVestPickup(player, definition, item) {
  const previousVest = setVestItem(player, {
    id: definition.id,
    maxDurability: Number(item?.extraData?.maxDurability ?? definition.maxDurability ?? 0),
    durability: Number(item?.extraData?.durability ?? definition.maxDurability ?? 0),
    absorption: Number(item?.extraData?.absorption ?? definition.absorption ?? 0),
  });

  if (previousVest?.id && Number(previousVest.durability || 0) > 0) {
    spawnDroppedItem(
      previousVest.id,
      player.x + 0.18,
      player.y - 0.12,
      1,
      12000,
      0,
      {
        durability: Number(previousVest.durability || 0),
        maxDurability: Number(previousVest.maxDurability || 0),
        absorption: Number(previousVest.absorption || 0),
      }
    );
  }

  return true;
}

function applyHealPickup(player, definition) {
  const healType = definition?.healType || definition?.id;

  if (healType === 'bandage') {
    addBandages(player, 1);
    return true;
  }

  addMeds(player, 1);
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
      return applyWeaponPickup(player, definition, item);

    case 'scope':
      return applyScopePickup(player, definition);

    case 'vest':
      return applyVestPickup(player, definition, item);

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
