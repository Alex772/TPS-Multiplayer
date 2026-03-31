function ensurePlayerInventory(player) {
  if (!player.inventory) {
    player.inventory = {
      scope: null,
      meds: 0,
    };
  }
  if (!Object.prototype.hasOwnProperty.call(player.inventory, 'scope')) {
    player.inventory.scope = null;
  }
  if (!Object.prototype.hasOwnProperty.call(player.inventory, 'meds')) {
    player.inventory.meds = 0;
  }
  return player.inventory;
}

function setScopeItem(player, zoom) {
  const inventory = ensurePlayerInventory(player);
  const normalized = Number.isFinite(Number(zoom)) ? Number(zoom) : null;
  const previous = inventory.scope ?? null;
  inventory.scope = normalized && normalized > 1 ? normalized : null;
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
  inventory.meds += amount;
}

module.exports = { ensurePlayerInventory, setScopeItem, clearScopeItem, addMeds };
