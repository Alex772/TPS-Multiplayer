
const { players } = require('../players');
const { getSpawn } = require('../players');

function killPlayer(target) {
  target.hp = 0;
  target.espectador = true;
  target.respawnAt = Date.now() + 3000;
}

function processRespawns(now) {
  for (const id in players) {
    const p = players[id];
    if (!p || !p.espectador || !p.respawnAt || now < p.respawnAt) continue;
    const spawn = getSpawn();
    p.x = spawn.x;
    p.y = spawn.y;
    p.hp = p.maxHp || 100;
    p.espectador = false;
    p.respawnAt = 0;
  }
}

module.exports = { killPlayer, processRespawns };
