const { players } = require('../players');
const { bullets } = require('../bullets');
const { saveSnapshot } = require('./snapshots');
const { processWeaponSwitch } = require('../combat/weaponSwitch');
const { processWeaponReload } = require('../combat/reloads');
const { recoverWeaponRecoil } = require('../combat/recoil');
const { updatePlayerMovement } = require('../movement/playerMovement');
const { tryHitPlayers } = require('../combat/hits');
const { isBulletBlocked } = require('../map');
const { buildStateForPlayer } = require('../visibility');

const TICK = 1000 / 60;

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    if (!b) continue;

    const stepSpeed = b.speed ?? 0.2;
    b.x += b.dx * stepSpeed;
    b.y += b.dy * stepSpeed;
    b.distanceTraveled += stepSpeed;

    if (b.distanceTraveled >= b.range) {
      bullets.splice(i, 1);
      continue;
    }

    if (isBulletBlocked(b.x, b.y, false)) {
      bullets.splice(i, 1);
      continue;
    }

    const hit = tryHitPlayers(b, () => bullets.splice(i, 1));
    if (hit) continue;
  }
}

function emitStates(io) {
  for (const socketId in players) {
    const state = buildStateForPlayer(socketId, bullets);
    if (state) io.to(socketId).emit('state', state);
  }
}

function gameLoop(io) {
  setInterval(() => {
    const now = Date.now();
    saveSnapshot(players);

    for (const id in players) {
      const p = players[id];
      if (!p) continue;

      processWeaponSwitch(p, now);
      processWeaponReload(p, now);
      recoverWeaponRecoil(p);

      if (now - (p.lastInput || 0) > 120) {
        p.input = {
          seq: p.input?.seq ?? 0,
          up: false,
          down: false,
          left: false,
          right: false,
        };
      }

      updatePlayerMovement(p);

      // IMPORTANTE:
      // não existe mais pickup automático aqui.
      // pickup agora só acontece via comando explícito do jogador (tecla E).

      if (p.input?.seq !== undefined) p.lastProcessedInput = p.input.seq;
      if (p.hit && now - p.lastHitAt > 120) p.hit = false;
    }

    updateBullets();
    emitStates(io);
  }, TICK);
}

module.exports = { gameLoop };