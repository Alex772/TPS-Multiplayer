//server/game/map.js

const { layers, TILES, MAP_WIDTH, MAP_HEIGHT } = require("./map/mapState");
const { isWall, isBulletBlocked } = require("./map/mapCollision");
const { tryPickupItem } = require("./map/mapQueries");
const { damageObject } = require("./map/mapObjects");

module.exports = {
  layers,
  TILES,
  MAP_WIDTH,
  MAP_HEIGHT,
  isWall,
  isBulletBlocked,
  tryPickupItem,
  damageObject
};