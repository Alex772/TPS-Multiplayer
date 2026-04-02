function getDistanceDamageMultiplier(distanceTraveled, range, damageFalloff) {
  const safeRange = Math.max(0.0001, Number(range) || 0.0001);
  const safeDistance = Math.max(0, Number(distanceTraveled) || 0);

  const startRatio = Math.min(1, Math.max(0, Number(damageFalloff?.startRatio) || 0));
  const minMultiplier = Math.min(1, Math.max(0, Number(damageFalloff?.minMultiplier) || 1));

  const startDistance = safeRange * startRatio;
  if (safeDistance <= startDistance) return 1;
  if (safeDistance >= safeRange) return minMultiplier;

  const remainingDistance = safeRange - startDistance;
  if (remainingDistance <= 0) return minMultiplier;

  const t = (safeDistance - startDistance) / remainingDistance;
  return 1 - (1 - minMultiplier) * t;
}

function getBulletDamageAtDistance(bullet) {
  const baseDamage = Math.max(0, Number(bullet?.damage) || 0);
  const multiplier = getDistanceDamageMultiplier(
    bullet?.distanceTraveled,
    bullet?.range,
    bullet?.damageFalloff
  );

  return baseDamage * multiplier;
}

module.exports = {
  getDistanceDamageMultiplier,
  getBulletDamageAtDistance,
};
