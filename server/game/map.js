
const { mapData, layers, TILES, MAP_WIDTH, MAP_HEIGHT, spawnPoints, lootSpawns } = require("./map/mapState");
const { isWall, isBulletBlocked } = require("./map/mapCollision");
const { tryPickupItemTile, isInsideMap } = require("./map/mapQueries");
const { damageObject } = require("./map/mapObjects");

module.exports = {
  mapData,
  layers,
  TILES,
  MAP_WIDTH,
  MAP_HEIGHT,
  spawnPoints,
  lootSpawns,
  isWall,
  isBulletBlocked,
  tryPickupItemTile,
  isInsideMap,
  damageObject,
};
