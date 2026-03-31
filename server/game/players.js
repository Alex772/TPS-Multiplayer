const { players, createWeaponInstance } = require('./players/playerState');
const { getSpawn, getCurrentWeapon } = require('./players/playerQueries');
const { addPlayer, removePlayer, respawnPlayer, switchWeapon, setPlayerAim, setPlayerScope } = require('./players/playerLifecycle');

module.exports = {
  players,
  createWeaponInstance,
  getSpawn,
  getCurrentWeapon,
  addPlayer,
  removePlayer,
  respawnPlayer,
  switchWeapon,
  setPlayerAim,
  setPlayerScope,
};
