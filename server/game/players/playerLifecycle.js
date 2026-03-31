const { getWeapon } = require('../weapons');
const { players, createWeaponInstance } = require('./playerState');
const { getSpawn, getCurrentWeapon } = require('./playerQueries');
const { ensurePlayerInventory } = require('../items/inventory');

function createBasePlayer(id) {
  const spawn = getSpawn();
  const player = {
    id,
    x: spawn.x,
    y: spawn.y,
    hp: 100,
    input: {},
    lastInput: 0,
    lastProcessedInput: 0,
    lastShot: 0,
    lastHitAt: 0,
    hit: false,
    angle: 0,
    aim: { dx: 1, dy: 0 },
    ads: false,
    activeScope: 1,
    loadout: {
      primary: createWeaponInstance('rifle'),
      secondary: createWeaponInstance('pistol'),
      current: 'primary',
    },
    isSwitching: false,
    switchEndTime: 0,
    nextWeapon: null,
    espectador: false,
  };
  ensurePlayerInventory(player);
  return player;
}

function addPlayer(id) {
  players[id] = createBasePlayer(id);
  return players[id];
}

function respawnPlayer(player) {
  const spawn = getSpawn();
  player.x = spawn.x;
  player.y = spawn.y;
  player.hp = 100;
  player.espectador = false;
  player.hit = false;
}

function switchWeapon(player, target) {
  if (!player || !player.loadout) return;
  if (player.isSwitching) return;
  if (target !== 'primary' && target !== 'secondary') return;
  if (!player.loadout[target]) return;
  if (player.loadout.current === target) return;

  const currentWeaponState = getCurrentWeapon(player);
  if (!currentWeaponState) return;
  const current = getWeapon(currentWeaponState.weaponId);
  const next = getWeapon(player.loadout[target].weaponId);
  if (!current || !next) return;

  const swapTime = current.handling.swapTime + (current.handling.weight + next.handling.weight) * 100;
  player.isSwitching = true;
  player.switchEndTime = Date.now() + swapTime;
  player.nextWeapon = target;
  currentWeaponState.isReloading = false;
  currentWeaponState.reloadEndTime = 0;
}

function setPlayerAim(player, dx, dy, ads = false) {
  if (!player) return;
  player.aim = { dx, dy };
  player.angle = Math.atan2(dy, dx);
  player.ads = !!ads;
}

function setPlayerScope(player, zoom) {
  if (!player) return false;
  const scopeZoom = Number(player.inventory?.scope || 0);
  if (!scopeZoom || scopeZoom !== Number(zoom)) return false;
  player.activeScope = scopeZoom;
  return true;
}

function removePlayer(id) {
  delete players[id];
}

module.exports = { addPlayer, removePlayer, respawnPlayer, switchWeapon, setPlayerAim, setPlayerScope };
