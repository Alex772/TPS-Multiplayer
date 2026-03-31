const { layers, TILES, MAP_WIDTH, MAP_HEIGHT } = require('./mapState');
const { damageObject } = require('./mapObjects');

function inBoundsTile(tx, ty) {
  return tx >= 0 && ty >= 0 && tx < MAP_WIDTH && ty < MAP_HEIGHT;
}

function isWall(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (!inBoundsTile(tx, ty)) return true;
  if (layers.collision[ty][tx] === TILES.WALL) return true;
  if (layers.interactive[ty][tx] !== TILES.EMPTY) return true;
  return false;
}

function isSightBlockingTile(tx, ty) {
  if (!inBoundsTile(tx, ty)) return true;
  return layers.collision[ty][tx] === TILES.WALL || layers.interactive[ty][tx] !== TILES.EMPTY;
}

function isBulletBlocked(x, y, isOver = false) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (!inBoundsTile(tx, ty)) return true;
  if (layers.collision[ty][tx] === TILES.WALL) return true;
  if (layers.interactive[ty][tx] !== TILES.EMPTY) {
    if (!isOver) damageObject(x, y);
    return !isOver;
  }
  return false;
}

function hasLineOfSight(ax, ay, bx, by, sampleStep = 0.18) {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  if (dist <= 0.001) return true;
  const steps = Math.max(1, Math.ceil(dist / sampleStep));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = ax + dx * t;
    const y = ay + dy * t;
    if (isSightBlockingTile(Math.floor(x), Math.floor(y))) return false;
  }
  return true;
}

module.exports = { isWall, isBulletBlocked, hasLineOfSight, isSightBlockingTile };
