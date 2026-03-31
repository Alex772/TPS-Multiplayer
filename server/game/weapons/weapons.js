const { weapons } = require('./weaponDefinitions');

function getWeapon(id) {
  return weapons[id] || null;
}

module.exports = { weapons, getWeapon };
