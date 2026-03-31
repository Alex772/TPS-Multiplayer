const { spawns } = require('../map/mapState');
const { randomChoice } = require('../utils/random');

function getSpawn() {
  return randomChoice(spawns) || { x: 2.5, y: 2.5 };
}

function getCurrentWeapon(player) {
  if (!player?.loadout?.current) return null;
  return player.loadout[player.loadout.current] || null;
}

module.exports = { getSpawn, getCurrentWeapon };
