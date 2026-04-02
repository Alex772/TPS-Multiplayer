const { ensurePlayerInventory, consumeMeds, consumeBandages } = require('../items/inventory');
const { startAction, clearAction } = require('../actions');

const BASE_MEDKIT_USE_MS = 3200;
const BASE_MEDKIT_HEAL = 45;
const BASE_BANDAGE_USE_MS = 1800;
const BASE_BANDAGE_HEAL = 15;

function getEquippedWeaponsWeight(player) {
  const primaryWeight = Number(player?.loadout?.primary?.weaponDef?.handling?.weight || 0);
  const secondaryWeight = Number(player?.loadout?.secondary?.weaponDef?.handling?.weight || 0);
  return primaryWeight + secondaryWeight;
}

function getMedkitUseDuration(player) {
  const totalWeight = getEquippedWeaponsWeight(player);
  return Math.round(BASE_MEDKIT_USE_MS + totalWeight * 350);
}

function beginUseMedkit(player, now = Date.now()) {
  if (!player || player.hp <= 0 || player.espectador) return false;

  const inventory = ensurePlayerInventory(player);
  if ((inventory.meds || 0) <= 0) return false;
  if (player.hp >= 100) return false;
  if (player.isSwitching) return false;

  return startAction(player, 'medkit', getMedkitUseDuration(player), null, now);
}

function getBandageUseDuration() {
  return BASE_BANDAGE_USE_MS;
}

function beginUseBandage(player, now = Date.now()) {
  if (!player || player.hp <= 0 || player.espectador) return false;

  const inventory = ensurePlayerInventory(player);
  if ((inventory.bandages || 0) <= 0) return false;
  if (player.hp >= 100) return false;
  if (player.isSwitching) return false;

  return startAction(player, 'bandage', getBandageUseDuration(), null, now);
}

function processMedkit(player, now = Date.now()) {
  const action = player?.action;
  if (!action?.locked) return;
  if (now < action.endAt) return;

  if (action.type === 'medkit') {
    if (consumeMeds(player, 1)) {
      player.hp = Math.min(100, Number(player.hp || 0) + BASE_MEDKIT_HEAL);
    }
    clearAction(player);
    return;
  }

  if (action.type === 'bandage') {
    if (consumeBandages(player, 1)) {
      player.hp = Math.min(100, Number(player.hp || 0) + BASE_BANDAGE_HEAL);
    }
    clearAction(player);
  }
}

module.exports = {
  beginUseMedkit,
  beginUseBandage,
  processMedkit,
  getEquippedWeaponsWeight,
  getMedkitUseDuration,
  getBandageUseDuration,
};
