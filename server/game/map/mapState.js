//server/game/map/mapState.js

const { carregarMapa } = require("./mapLoader");

const mapData = carregarMapa();

const MAP_WIDTH = mapData.width;
const MAP_HEIGHT = mapData.height;

const baseLayer = mapData.layers[0];

const layers = {
  collision: [],
  interactive: [],
  interactiveHP: [],
  items: []
};

const TILES = {
  EMPTY: 0,
  WALL: 1,
  BARREL: 2,
  CAR: 3,
  ITEM_GUN: 4,
  ITEM_AMMO: 5
};

function initMap() {
  for (let y = 0; y < MAP_HEIGHT; y++) {
    layers.collision[y] = [];
    layers.interactive[y] = [];
    layers.interactiveHP[y] = [];
    layers.items[y] = [];

    for (let x = 0; x < MAP_WIDTH; x++) {

      layers.collision[y][x] = baseLayer.collision[y][x];

      const obj = baseLayer.interactive[y][x];
      layers.interactive[y][x] = obj;

      if (obj === TILES.BARREL) {
        layers.interactiveHP[y][x] = 50;
      } else if (obj === TILES.CAR) {
        layers.interactiveHP[y][x] = 150;
      } else {
        layers.interactiveHP[y][x] = 0;
      }

      layers.items[y][x] = baseLayer.items[y][x];
    }
  }
}

initMap();

module.exports = {
  layers,
  TILES,
  MAP_WIDTH,
  MAP_HEIGHT
};