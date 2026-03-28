//server\game\map.js
// ============================
// MAPA (CAMADAS)
// ============================
const path = require('path');
const fs = require('fs');





// Mapas
const mapas = [
  { nome: "Mapa 1", caminho: "maps/map1.json" },
  { nome: "Mapa 2", caminho: "maps/map2.json" },
  // Adicione mais mapas aqui...
];

// Função para selecionar um mapa aleatório
function selecionarMapaAleatorio() {
  const indiceAleatorio = Math.floor(Math.random() * mapas.length);
  const mapaSelecionado = mapas[indiceAleatorio];
  return mapaSelecionado;
}

// Exemplo de uso
const mapaAleatorio = selecionarMapaAleatorio();


// Lê o JSON
const mapFilePath = path.resolve(__dirname, mapaAleatorio.caminho);

const mapData = JSON.parse(fs.readFileSync(mapFilePath, 'utf8'));







// Dimensões do mapa
const MAP_WIDTH = mapData.width;
const MAP_HEIGHT = mapData.height;

// ============================
// TIPOS DE TILES
// ============================

const TILES = {
    EMPTY: 0,
    WALL: 1,
    BARREL: 2,
    CAR: 3,
    ITEM_GUN: 4,
    ITEM_AMMO: 5
};

// ============================
// CAMADAS DO MAPA
// ============================

// Aqui pegamos direto do JSON
const baseLayer = mapData.layers[0];

const layers = {
    collision: [],     // parede sólida
    interactive: [],   // objetos (barris, carros)
    interactiveHP: [], // vida dos objetos
    items: []          // itens
};

// ============================
// INICIALIZAÇÃO DO MAPA
// ============================

function initMapFromJSON() {
    for (let y = 0; y < MAP_HEIGHT; y++) {
        layers.collision[y] = [];
        layers.interactive[y] = [];
        layers.interactiveHP[y] = [];
        layers.items[y] = [];

        for (let x = 0; x < MAP_WIDTH; x++) {

            // =====================
            // CAMADA 1 - COLISÃO
            // =====================
            layers.collision[y][x] = baseLayer.collision[y][x];

            // =====================
            // CAMADA 2 - INTERATIVOS
            // =====================
            const obj = baseLayer.interactive[y][x];
            layers.interactive[y][x] = obj;

            // Define HP baseado no tipo
            if (obj === TILES.BARREL) {
                layers.interactiveHP[y][x] = 50;
            } else if (obj === TILES.CAR) {
                layers.interactiveHP[y][x] = 150;
            } else {
                layers.interactiveHP[y][x] = 0;
            }

            // =====================
            // CAMADA 3 - ITENS
            // =====================
            layers.items[y][x] = baseLayer.items[y][x];
        }
    }
}

// Inicializa usando JSON
initMapFromJSON();

// ============================
// CHECAR COLISÃO
// ============================

// Usado para jogadores e outras coisas que sempre colidem com objetos de camada 2
function isWall(x, y) {
    let tx = Math.floor(x);
    let ty = Math.floor(y);





    if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) {
        return true;
    }

    // Checa colisão física (Camada 1)
    if (layers.collision[ty][tx] === TILES.WALL) return true;
    
    // Objetos da Camada 2 bloqueiam passagem
    if (layers.interactive[ty][tx] !== TILES.EMPTY) return true;

    return false;
}

// Usado especificamente para balas
function isBulletBlocked(x, y, isOver = false) {
    let tx = Math.floor(x);
    let ty = Math.floor(y);

    if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) {
        return true;
    }

    // Camada 1 sempre bloqueia (paredes altas)
    if (layers.collision[ty][tx] === TILES.WALL) return true;

    // Camada 2 bloqueia apenas se a bala NÃO estiver "por cima"
    if (layers.interactive[ty][tx] !== TILES.EMPTY) {
        if (!isOver) {
            damageObject(x, y); // Aplica dano ao objeto
            return true; // Bloqueia o tiro
        }
        // Se isOver for true, a bala passa direto sem chamar damageObject
        return false; 
    }

    return false;
}

// ============================
// INTERAÇÃO COM CAMADAS
// ============================

// Tenta pegar um item na posição (x, y)
function tryPickupItem(x, y) {
    let tx = Math.floor(x);
    let ty = Math.floor(y);

    if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) return null;

    let item = layers.items[ty][tx];
    if (item !== TILES.EMPTY) {
        layers.items[ty][tx] = TILES.EMPTY; // Remove item do mapa
        return item;
    }
    return null;
}

// Tenta danificar objeto de cobertura
function damageObject(x, y, damage = 20) {
    let tx = Math.floor(x);
    let ty = Math.floor(y);

    if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) return false;

    let obj = layers.interactive[ty][tx];
    if (obj !== TILES.EMPTY) {
        layers.interactiveHP[ty][tx] -= damage;

        // Se HP acabar, remove objeto
        if (layers.interactiveHP[ty][tx] <= 0) {
            layers.interactive[ty][tx] = TILES.EMPTY;
            layers.interactiveHP[ty][tx] = 0;
            return true;
        }
        return false; // Objeto ainda de pé
    }
    return false;
}



module.exports = { 
    layers, 
    isWall, 
    isBulletBlocked, 
    TILES, 
    MAP_WIDTH, 
    MAP_HEIGHT, 
    tryPickupItem, 
    damageObject 
};