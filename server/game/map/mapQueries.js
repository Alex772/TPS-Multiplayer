const { MAP_WIDTH, MAP_HEIGHT } = require('./mapState');

function clampToMap(x, y) {
  return {
    x: Math.max(0, Math.min(MAP_WIDTH - 0.01, x)),
    y: Math.max(0, Math.min(MAP_HEIGHT - 0.01, y)),
  };
}

module.exports = { clampToMap };
