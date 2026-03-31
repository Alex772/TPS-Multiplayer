const { layers, TILES, MAP_WIDTH, MAP_HEIGHT } = require('./mapState');

function damageObject(x, y, damage = 20) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) return false;
  const obj = layers.interactive[ty][tx];
  if (obj === TILES.EMPTY) return false;
  layers.interactiveHP[ty][tx] -= damage;
  if (layers.interactiveHP[ty][tx] <= 0) {
    layers.interactive[ty][tx] = TILES.EMPTY;
    layers.interactiveHP[ty][tx] = 0;
    return true;
  }
  return false;
}

module.exports = { damageObject };
