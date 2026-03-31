const path = require('path');
const fs = require('fs');
const mapsIndex = require('../../database/maps.json');

function getMapEntry(mapId) {
  const fallback = mapsIndex.maps?.[0] || null;
  if (!mapId) return mapsIndex.maps?.find((m) => m.id === mapsIndex.activeMap) || fallback;
  return mapsIndex.maps?.find((m) => m.id === mapId) || fallback;
}

function loadMap(mapId) {
  const entry = getMapEntry(mapId);
  if (!entry) {
    throw new Error('Nenhum mapa configurado em server/database/maps.json');
  }

  const filePath = path.resolve(__dirname, '../../database', entry.file.replace('./', ''));
  const mapData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  mapData.id = mapData.id || entry.id;
  mapData.name = mapData.name || entry.name;
  return mapData;
}

module.exports = { loadMap, getMapEntry };
