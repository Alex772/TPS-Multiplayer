const { isWall } = require('../map');
const { MAP_WIDTH, MAP_HEIGHT } = require('../map/mapState');
const { normalize, clamp } = require('../utils/math');

const SPEED = 0.05;
const HALF = 0.23;

function canOccupy(x, y) {
  return (
    !isWall(x - HALF, y - HALF) &&
    !isWall(x + HALF, y - HALF) &&
    !isWall(x - HALF, y + HALF) &&
    !isWall(x + HALF, y + HALF)
  );
}

function updatePlayerMovement(player) {
  if (!player || !player.input) return;

  let dx = 0;
  let dy = 0;

  if (player.input.up) dy -= 1;
  if (player.input.down) dy += 1;
  if (player.input.left) dx -= 1;
  if (player.input.right) dx += 1;

  if (dx === 0 && dy === 0) return;

  const dir = normalize(dx, dy);
  const speed = SPEED;
  const newX = clamp(player.x + dir.dx * speed, 0.2, MAP_WIDTH - 0.2);
  const newY = clamp(player.y + dir.dy * speed, 0.2, MAP_HEIGHT - 0.2);

  if (player.hp <= 0) {
    player.x = newX;
    player.y = newY;
    return;
  }

  if (canOccupy(newX, player.y)) player.x = newX;
  if (canOccupy(player.x, newY)) player.y = newY;
}

module.exports = { updatePlayerMovement, SPEED, PLAYER_HALF: HALF };
