//server/game/map/mapLoader.js

const path = require("path");
const fs = require("fs");

// lista de mapas
const mapas = [
  { nome: "Mapa 1", caminho: "../../database/maps/map1.json" },
  { nome: "Mapa 2", caminho: "../../database/maps/map2.json" }
];

function selecionarMapaAleatorio() {
  const i = Math.floor(Math.random() * mapas.length);
  return mapas[i];
}

function carregarMapa() {
  const mapa = selecionarMapaAleatorio();

  const filePath = path.resolve(__dirname, mapa.caminho);
  const mapData = JSON.parse(fs.readFileSync(filePath, "utf8"));

  return mapData;
}

module.exports = { carregarMapa };