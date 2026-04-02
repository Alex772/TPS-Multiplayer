const { players, respawnPlayer } = require('../players');
const { dropPlayerItems } = require('../items/itemDrops');
const { clearAction } = require('../actions');
const { applyVestDamage } = require('../items/inventory');
const { getBulletDamageAtDistance } = require('./damageFalloff');

const HIT_RADIUS = 0.35;
const RESPAWN_MS = 3000;

function tryHitPlayers(bullet, removeBullet) {
  for (const id in players) {
    const realPlayer = players[id];
    const snapshotPlayer = bullet.snapshotPlayers?.[id] || realPlayer;
    if (!realPlayer || !snapshotPlayer) continue;
    if (id === bullet.owner) continue;
    if (realPlayer.espectador) continue;
    if (realPlayer.hp <= 0) continue;

    const dist = Math.hypot(snapshotPlayer.x - bullet.x, snapshotPlayer.y - bullet.y);
    if (dist >= HIT_RADIUS) continue;

    applyDamage(realPlayer, bullet.owner, getBulletDamageAtDistance(bullet));
    removeBullet();
    return true;
  }
  return false;
}

function cancelInterruptedActions(target) {
  if (!target?.action?.locked) return;
  if (target.action.type === 'medkit' || target.action.type === 'bandage') {
    clearAction(target);
  }
}

function applyDamage(target, ownerId, damage) {
  cancelInterruptedActions(target);
  const result = applyVestDamage(target, damage);
  target.hp -= result.healthDamage;
  target.lastHitAt = Date.now();
  const owner = players[ownerId];
  if (owner) owner.hit = true;

  if (target.hp > 0) return;
  target.hp = 0;
  target.espectador = true;
  target.ads = false;
  clearAction(target);
  dropPlayerItems(target);
  setTimeout(() => {
    if (!players[target.id]) return;
    respawnPlayer(players[target.id]);
  }, RESPAWN_MS);
}

module.exports = { tryHitPlayers };
