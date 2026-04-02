const { players, getCurrentWeapon } = require('./players');
const { getWeapon } = require('./weapons');
const { getSnapshotAt } = require('./core/snapshots');
const { nextId } = require('./utils/ids');

let bullets = [];

function getAdsSpreadMultiplier(player, weapon) {
  if (!player?.ads || !player?.inventory?.scope) return 1;
  return Math.max(0.35, Number(weapon?.vision?.ads?.spreadMultiplier ?? 0.85));
}

function getAdsRecoilMultiplier(player, weapon) {
  if (!player?.ads || !player?.inventory?.scope) return 1;
  return Math.max(0.35, Number(weapon?.vision?.ads?.recoilMultiplier ?? 0.88));
}

function clampRecoil(player, weaponState, weapon) {
  const recoilStep = weapon.recoil.perShot * getAdsRecoilMultiplier(player, weapon);
  weaponState.recoilCurrent += recoilStep;
  if (weaponState.recoilCurrent > weapon.recoil.max) weaponState.recoilCurrent = weapon.recoil.max;
}

function applySpread(baseDx, baseDy, weapon, recoilCurrent, spreadMultiplier = 1) {
  const baseAngle = Math.atan2(baseDy, baseDx);
  const effectiveSpread = weapon.spread * spreadMultiplier;

  // spread base = imprecisão natural da arma
  const spreadOffset = (Math.random() - 0.5) * effectiveSpread;

  // recoil acumulado = abre mais o cone ao segurar o disparo
  const recoilOffset = (Math.random() - 0.5) * 2 * recoilCurrent * weapon.recoilSpreadMultiplier;

  const finalAngle = baseAngle + spreadOffset + recoilOffset;
  return {
    dx: Math.cos(finalAngle),
    dy: Math.sin(finalAngle),
  };
}

function createBullet({ owner, x, y, dx, dy, weapon, snapshotPlayers, shotTime }) {
  return {
    id: nextId('bullet'), x, y, dx, dy,
    speed: weapon.bulletSpeed ?? 0.2,
    range: weapon.range,
    distanceTraveled: 0,
    owner,
    damage: weapon.damage,
    weaponId: weapon.id,
    damageFalloff: weapon.damageFalloff || null,
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

  clampRecoil(p, weaponState, weapon);
  p.lastShot = now;
  weaponState.ammoInMag--;

  const pelletCount = Math.max(1, Number(weapon.pellets) || 1);
  const spreadMultiplier = getAdsSpreadMultiplier(p, weapon);
  for (let i = 0; i < pelletCount; i++) {
    const spreadResult = applySpread(Number(data.dx), Number(data.dy), weapon, weaponState.recoilCurrent, spreadMultiplier);
    if (!spreadResult) continue;
    bullets.push(createBullet({ owner: id, x: p.x, y: p.y, dx: spreadResult.dx, dy: spreadResult.dy, weapon, snapshotPlayers, shotTime: realShotTime }));
  }
}

module.exports = { bullets, handleShoot };
