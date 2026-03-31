const { loadMap } = require('./mapLoader');

const mapData = loadMap();
const MAP_WIDTH = Number(mapData.width || 0);
const MAP_HEIGHT = Number(mapData.height || 0);
const baseLayer = mapData.layers?.[0] || {};

const TILES = {
  EMPTY: 0,
  WALL: 1,
  BARREL: 2,
  CAR: 3,
};

const layers = {
  collision: [],
  interactive: [],
  interactiveHP: [],
  items: [],
};

const spawns = Array.isArray(mapData.spawns) && mapData.spawns.length > 0
  ? mapData.spawns
  : [{ x: 2.5, y: 2.5 }, { x: MAP_WIDTH - 2.5, y: MAP_HEIGHT - 2.5 }];

const placedItems = Array.isArray(mapData.placedItems) ? mapData.placedItems : [];

function initMap() {
  for (let y = 0; y < MAP_HEIGHT; y++) {
    layers.collision[y] = [];
    layers.interactive[y] = [];
    layers.interactiveHP[y] = [];
    layers.items[y] = [];

    for (let x = 0; x < MAP_WIDTH; x++) {
      layers.collision[y][x] = baseLayer.collision?.[y]?.[x] ?? 0;
      layers.interactive[y][x] = baseLayer.interactive?.[y]?.[x] ?? 0;
      layers.items[y][x] = baseLayer.items?.[y]?.[x] ?? 0;

      const obj = layers.interactive[y][x];
      if (obj === TILES.BARREL) layers.interactiveHP[y][x] = 50;
      else if (obj === TILES.CAR) layers.interactiveHP[y][x] = 150;
      else layers.interactiveHP[y][x] = 0;
    }
  }
}

initMap();

module.exports = { mapData, layers, TILES, MAP_WIDTH, MAP_HEIGHT, spawns, placedItems };
