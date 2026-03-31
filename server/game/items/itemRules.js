const items = require('../../database/items.json');

function getItemDefinition(id) {
  return items[id] || null;
}

function listItemDefinitions() {
  return items;
}

module.exports = { getItemDefinition, listItemDefinitions };
