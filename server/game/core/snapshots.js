const history = [];
const MAX_HISTORY = 1000;

function saveSnapshot(players) {
  const snapshot = { time: Date.now(), players: {} };
  for (const id in players) {
    const p = players[id];
    snapshot.players[id] = { x: p.x, y: p.y };
  }
  history.push(snapshot);
  while (history.length > 0 && Date.now() - history[0].time > MAX_HISTORY) history.shift();
}

function getSnapshotAt(time) {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].time <= time) return history[i];
  }
  return null;
}

module.exports = { saveSnapshot, getSnapshotAt };
