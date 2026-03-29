// guarda histórico dos players
const history = [];

// quanto tempo guardar (ms)
const MAX_HISTORY = 1000; // 1 segundo

function saveSnapshot(players) {

    const snapshot = {
        time: Date.now(),
        players: {}
    };

    for (let id in players) {
        const p = players[id];

        snapshot.players[id] = {
            x: p.x,
            y: p.y
        };
    }

    history.push(snapshot);

    // remove snapshots antigos
    while (history.length > 0 && Date.now() - history[0].time > MAX_HISTORY) {
        history.shift();
    }
}

// 🔥 pega posição no passado
function getSnapshotAt(time) {

    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].time <= time) {
            return history[i];
        }
    }

    return null;
}

module.exports = {
    saveSnapshot,
    getSnapshotAt
};