const { nextId } = require('../utils/ids');
const { placedItems } = require('../map/mapState');
const { getItemDefinition } = require('./itemRules');

let worldItems = [];

function initWorldItems() {
  worldItems = (placedItems || []).map((entry) => ({
    worldId: nextId('item'),
    id: entry.id,
    x: Number(entry.x),
    y: Number(entry.y),
    amount: Number(entry.amount || 1),
    respawnMs: Number(entry.respawnMs || 15000),
    hiddenUntil: 0,
  }));
}

function getWorldItems() {
  return worldItems;
}

function getVisibleWorldItems(now = Date.now()) {
  return worldItems.filter((item) => now >= item.hiddenUntil);
}

function removeWorldItem(worldId, now = Date.now()) {
  const item = worldItems.find((entry) => entry.worldId === worldId);
  if (!item) return false;

  item.hiddenUntil = now + item.respawnMs;
  return true;
}

function spawnDroppedItem(itemId, x, y, amount = 1, respawnMs = 20000, pickupDelayMs = 0) {
  if (!getItemDefinition(itemId)) return null;

  const now = Date.now();

  const entry = {
    worldId: nextId('item'),
    id: itemId,
    x: Number(x),
    y: Number(y),
    amount: Number(amount),
    respawnMs: Number(respawnMs),
    hiddenUntil: now + Number(pickupDelayMs || 0),
  };

  worldItems.push(entry);
  return entry;
}

initWorldItems();

module.exports = {
  initWorldItems,
  getWorldItems,
  getVisibleWorldItems,
  removeWorldItem,
  spawnDroppedItem
};