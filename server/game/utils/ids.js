let counters = new Map();

function nextId(prefix = 'id') {
  const value = (counters.get(prefix) || 0) + 1;
  counters.set(prefix, value);
  return `${prefix}_${value}`;
}

module.exports = { nextId };
