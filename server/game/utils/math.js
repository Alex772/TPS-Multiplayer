function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function distance(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

function normalize(dx, dy) {
  const len = Math.hypot(dx, dy);

  // 🔥 CORREÇÃO: vetor zero NÃO pode ter direção
  if (len === 0) {
    return { dx: 0, dy: 0, len: 0 };
  }

  return {
    dx: dx / len,
    dy: dy / len,
    len
  };
}

function angleFromVector(dx, dy) {
  return Math.atan2(dy, dx);
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

module.exports = { clamp, lerp, distance, normalize, angleFromVector, angleDiff };
