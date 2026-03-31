//server/game/map/mapCollision.js

const { layers, TILES, MAP_WIDTH, MAP_HEIGHT } = require("./mapState");
const { damageObject } = require("./mapObjects");

function isWall(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);

  if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) {
    return true;
  }

  if (layers.collision[ty][tx] === TILES.WALL) return true;
  if (layers.interactive[ty][tx] !== TILES.EMPTY) return true;

  return false;
}

function isBulletBlocked(x, y, isOver = false) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);

  if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) {
    return true;
  }

  if (layers.collision[ty][tx] === TILES.WALL) return true;

  if (layers.interactive[ty][tx] !== TILES.EMPTY) {
    if (!isOver) {
      damageObject(x, y);
      return true;
    }
    return false;
  }

  return false;
}

module.exports = { isWall, isBulletBlocked };