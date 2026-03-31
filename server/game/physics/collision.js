function checkHit(bullet, player, radius = 0.5) {
  const dx = bullet.x - player.x;
  const dy = bullet.y - player.y;
  return Math.hypot(dx, dy) < radius;
}

module.exports = {
  checkHit,
};
