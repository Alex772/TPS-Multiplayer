//server/game/map/mapQueries.js

const { layers, TILES, MAP_WIDTH, MAP_HEIGHT } = require("./mapState");

function tryPickupItem(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);

  if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) return null;

  const item = layers.items[ty][tx];

  if (item !== TILES.EMPTY) {
    layers.items[ty][tx] = TILES.EMPTY;
    return item;
  }

  return null;
}

module.exports = { tryPickupItem };