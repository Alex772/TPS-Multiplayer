const PLAYER_SIZE = 0.46;
const HALF = PLAYER_SIZE / 2;

export function isWall(x, y) {
  const map = window.state?.map;
  const collision = map?.collision;
  if (!collision) return true;

  const tileX = Math.floor(x);
  const tileY = Math.floor(y);

  if (!collision[tileY] || collision[tileY][tileX] === undefined) return true;
  if (collision[tileY][tileX] === 1) return true;

  const interactive = map?.interactive;
  if (interactive?.[tileY]?.[tileX] && interactive[tileY][tileX] !== 0) return true;

  return false;
}

export function moveWithCollision(p, dx, dy) {
  if (!p) return;
  const nextX = p.x + dx;
  const nextY = p.y + dy;

  if (
    !isWall(nextX - HALF, p.y - HALF) &&
    !isWall(nextX + HALF, p.y - HALF) &&
    !isWall(nextX - HALF, p.y + HALF) &&
    !isWall(nextX + HALF, p.y + HALF)
  ) {
    p.x = nextX;
  }

  if (
    !isWall(p.x - HALF, nextY - HALF) &&
    !isWall(p.x + HALF, nextY - HALF) &&
    !isWall(p.x - HALF, nextY + HALF) &&
    !isWall(p.x + HALF, nextY + HALF)
  ) {
    p.y = nextY;
  }
}
