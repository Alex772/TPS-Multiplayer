const items = require('../../database/items.json');

function getItemDefinition(id) {
  return items[id] || null;
}

function getScopeDefinition(scopeValue) {
  if (!scopeValue) return null;
  if (typeof scopeValue === 'string' && items[scopeValue]?.type === 'scope') {
    return items[scopeValue];
  }

  const zoom = Number(scopeValue);
  if (!Number.isFinite(zoom) || zoom <= 1) return null;

  return Object.values(items).find((item) => item.type === 'scope' && Number(item.zoom) === zoom) || null;
}

module.exports = { getItemDefinition, getScopeDefinition };
