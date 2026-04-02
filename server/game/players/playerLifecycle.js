const { players, createWeaponInstance, hydratePlayerRuntimeState } = require('./playerState');
const { getSpawn, getCurrentWeapon } = require('./playerQueries');
const { clearAction } = require('../actions');
const { getScopeDefinition } = require('../items/itemRules');

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
  player.inventory = {
    scope: null,
    meds: 0,
    bandages: 0,
    vest: null,
  };
  hydratePlayerRuntimeState(player);
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
  player.ads = false;
  player.activeScope = 1;
  player.isSwitching = false;
  player.switchEndTime = 0;
  player.nextWeapon = null;
  player.loadout = {
    primary: createWeaponInstance('rifle'),
    secondary: createWeaponInstance('pistol'),
    current: 'primary',
  };
  player.inventory = {
    scope: null,
    meds: 0,
    bandages: 0,
    vest: null,
  };
  hydratePlayerRuntimeState(player);
  player.action.type = null;
  player.action.startedAt = 0;
  player.action.endAt = 0;
  player.action.locked = false;
  player.action.meta = null;
}

function switchWeapon(player, target) {
  if (!player || !player.loadout) return;
  if (player.isSwitching) return;
  if (target !== 'primary' && target !== 'secondary') return;
  if (!player.loadout[target]) return;
  if (player.loadout.current === target) return;

  const currentWeaponState = getCurrentWeapon(player);
  if (!currentWeaponState) return;
  const current = currentWeaponState.weaponDef;
  const next = player.loadout[target].weaponDef;
  if (!current || !next) return;

  const swapTime = current.handling.swapTime + (current.handling.weight + next.handling.weight) * 100;
  player.isSwitching = true;
  player.switchEndTime = Date.now() + swapTime;
  player.nextWeapon = target;
  currentWeaponState.isReloading = false;
  currentWeaponState.reloadEndTime = 0;
  if (player.action?.type === 'reload') {
    clearAction(player);
  }
}

function updateActiveScopeState(player) {
  const scope = getScopeDefinition(player?.inventory?.scope);
  player.activeScope = player?.ads && scope ? Number(scope.zoom || 1) : 1;
}

function setPlayerAim(player, dx, dy, ads = false) {
  if (!player) return;
  player.aim = { dx, dy };
  player.angle = Math.atan2(dy, dx);
  const hasScope = !!getScopeDefinition(player.inventory?.scope);
  player.ads = !!ads && hasScope && player.hp > 0 && !player.espectador;
  updateActiveScopeState(player);
}

function setPlayerScope(player, scopeId) {
  if (!player) return false;
  const scope = getScopeDefinition(scopeId);
  if (!scope) {
    player.activeScope = 1;
    return false;
  }
  player.inventory.scope = scope.id;
  updateActiveScopeState(player);
  return true;
}

function togglePlayerScope(player) {
  if (!player) return false;
  updateActiveScopeState(player);
  return !!player.inventory?.scope;
}

function removePlayer(id) {
  delete players[id];
}

module.exports = { addPlayer, removePlayer, respawnPlayer, switchWeapon, setPlayerAim, setPlayerScope, togglePlayerScope, updateActiveScopeState };
