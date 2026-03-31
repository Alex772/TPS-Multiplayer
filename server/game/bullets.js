const { players, getCurrentWeapon } = require('./players');
const { getWeapon } = require('./weapons');
const { getSnapshotAt } = require('./core/snapshots');
const { nextId } = require('./utils/ids');

let bullets = [];

function clampRecoil(weaponState, weapon) {
  weaponState.recoilCurrent += weapon.recoil.perShot;
  if (weaponState.recoilCurrent > weapon.recoil.max) weaponState.recoilCurrent = weapon.recoil.max;
}

function applySpread(baseDx, baseDy, weapon, recoilCurrent) {
  let dx = baseDx + (Math.random() - 0.5) * weapon.spread + (Math.random() - 0.5) * recoilCurrent * weapon.recoilSpreadMultiplier;
  let dy = baseDy + (Math.random() - 0.5) * weapon.spread + (Math.random() - 0.5) * recoilCurrent * weapon.recoilSpreadMultiplier;
  const len = Math.hypot(dx, dy);
  if (len <= 0) return null;
  return { dx: dx / len, dy: dy / len };
}

function createBullet({ owner, x, y, dx, dy, weapon, snapshotPlayers, shotTime }) {
  return {
    id: nextId('bullet'), x, y, dx, dy,
    speed: weapon.bulletSpeed ?? 0.2,
    range: weapon.range,
    distanceTraveled: 0,
    owner,
    damage: weapon.damage,
    snapshotPlayers,
    shotTime,
  };
}

function canShoot(player, weaponState, weapon, now) {
  if (!player || player.hp <= 0 || player.espectador) return false;
  if (player.isSwitching || weaponState.isReloading) return false;
  if (now - player.lastShot < weapon.fireRate) return false;
  if (weaponState.ammoInMag <= 0) return false;
  return true;
}

function handleShoot(id, data) {
  const p = players[id];
  if (!p) return;
  const now = Date.now();
  const weaponState = getCurrentWeapon(p);
  if (!weaponState) return;
  const weapon = getWeapon(weaponState.weaponId);
  if (!weapon) return;
  if (!Number.isFinite(Number(data?.dx)) || !Number.isFinite(Number(data?.dy))) return;
  if (!canShoot(p, weaponState, weapon, now)) return;

  const shotTime = Number(data.time);
  const ping = Number(data.ping) || 0;
  if (!Number.isFinite(shotTime)) return;

  const realShotTime = shotTime - (ping / 2);
  const snapshot = getSnapshotAt(realShotTime);
  const snapshotPlayers = snapshot?.players || players;

  clampRecoil(weaponState, weapon);
  p.lastShot = now;
  weaponState.ammoInMag--;

  const pelletCount = Math.max(1, Number(weapon.pellets) || 1);
  for (let i = 0; i < pelletCount; i++) {
    const spreadResult = applySpread(Number(data.dx), Number(data.dy), weapon, weaponState.recoilCurrent);
    if (!spreadResult) continue;
    bullets.push(createBullet({ owner: id, x: p.x, y: p.y, dx: spreadResult.dx, dy: spreadResult.dy, weapon, snapshotPlayers, shotTime: realShotTime }));
  }
}

module.exports = { bullets, handleShoot };
