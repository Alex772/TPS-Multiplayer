const { players, createWeaponInstance, hydratePlayerRuntimeState } = require('./players/playerState');
const { getSpawn, getCurrentWeapon } = require('./players/playerQueries');
const { addPlayer, removePlayer, respawnPlayer, switchWeapon, setPlayerAim, setPlayerScope } = require('./players/playerLifecycle');

module.exports = {
  players,
  createWeaponInstance,
  hydratePlayerRuntimeState,
  getSpawn,
  getCurrentWeapon,
  addPlayer,
  removePlayer,
  respawnPlayer,
  switchWeapon,
  setPlayerAim,
  setPlayerScope,
};
