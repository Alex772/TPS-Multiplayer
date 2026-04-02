function ensurePlayerInventory(player) {
  if (!player.inventory) {
    player.inventory = {
      scope: null,
      meds: 0,
      bandages: 0,
      vest: null,
    };
  }
  if (!Object.prototype.hasOwnProperty.call(player.inventory, 'scope')) {
    player.inventory.scope = null;
  }
  if (!Object.prototype.hasOwnProperty.call(player.inventory, 'meds')) {
    player.inventory.meds = 0;
  }
  if (!Object.prototype.hasOwnProperty.call(player.inventory, 'bandages')) {
    player.inventory.bandages = 0;
  }
  if (!Object.prototype.hasOwnProperty.call(player.inventory, 'vest')) {
    player.inventory.vest = null;
  }
  return player.inventory;
}

function setScopeItem(player, scopeId) {
  const inventory = ensurePlayerInventory(player);
  const previous = inventory.scope ?? null;
  inventory.scope = scopeId || null;
  return previous;
}

function clearScopeItem(player) {
  const inventory = ensurePlayerInventory(player);
  const previous = inventory.scope ?? null;
  inventory.scope = null;
  return previous;
}

function addMeds(player, amount = 1) {
  const inventory = ensurePlayerInventory(player);
  inventory.meds += Math.max(0, Number(amount) || 0);
  return inventory.meds;
}

function consumeMeds(player, amount = 1) {
  const inventory = ensurePlayerInventory(player);
  const value = Math.max(0, Number(amount) || 0);
  if (inventory.meds < value) return false;
  inventory.meds -= value;
  return true;
}


function addBandages(player, amount = 1) {
  const inventory = ensurePlayerInventory(player);
  inventory.bandages += Math.max(0, Number(amount) || 0);
  return inventory.bandages;
}

function consumeBandages(player, amount = 1) {
  const inventory = ensurePlayerInventory(player);
  const value = Math.max(0, Number(amount) || 0);
  if (inventory.bandages < value) return false;
  inventory.bandages -= value;
  return true;
}

function setVestItem(player, vestData) {
  const inventory = ensurePlayerInventory(player);
  const previous = inventory.vest ? { ...inventory.vest } : null;

  if (!vestData) {
    inventory.vest = null;
    return previous;
  }

  inventory.vest = {
    id: vestData.id,
    maxDurability: Math.max(1, Number(vestData.maxDurability) || 1),
    durability: Math.max(0, Number(vestData.durability ?? vestData.maxDurability) || 0),
    absorption: Math.max(0, Number(vestData.absorption) || 0),
  };

  if (inventory.vest.durability <= 0) {
    inventory.vest = null;
  }

  return previous;
}

function clearVestItem(player) {
  const inventory = ensurePlayerInventory(player);
  const previous = inventory.vest ? { ...inventory.vest } : null;
  inventory.vest = null;
  return previous;
}

function applyVestDamage(player, rawDamage) {
  const inventory = ensurePlayerInventory(player);
  const vest = inventory.vest;
  const incoming = Math.max(0, Number(rawDamage) || 0);

  if (!vest || incoming <= 0) {
    return {
      incomingDamage: incoming,
      absorbedDamage: 0,
      healthDamage: incoming,
      vestBroken: false,
      remainingDurability: vest?.durability ?? 0,
    };
  }

  const desiredAbsorption = incoming * vest.absorption;
  const absorbedDamage = Math.min(vest.durability, desiredAbsorption);
  vest.durability = Math.max(0, vest.durability - absorbedDamage);

  const healthDamage = Math.max(0, incoming - absorbedDamage);
  const vestBroken = vest.durability <= 0;

  if (vestBroken) {
    inventory.vest = null;
  }

  return {
    incomingDamage: incoming,
    absorbedDamage,
    healthDamage,
    vestBroken,
    remainingDurability: vestBroken ? 0 : vest.durability,
  };
}

module.exports = {
  ensurePlayerInventory,
  setScopeItem,
  clearScopeItem,
  addMeds,
  consumeMeds,
  addBandages,
  consumeBandages,
  setVestItem,
  clearVestItem,
  applyVestDamage,
};
