const { isWall } = require('../map');
const { MAP_WIDTH, MAP_HEIGHT } = require('../map/mapState');
const { normalize, clamp } = require('../utils/math');

const SPEED = 0.05;
const ACTION_MEDKIT_MULTIPLIER = 0.35;
const ACTION_BANDAGE_MULTIPLIER = 0.6;
const ACTION_RELOAD_MULTIPLIER = 0.82;
const ADS_MULTIPLIER = 0.82;
const HALF = 0.23;

function canOccupy(x, y) {
  return (
    !isWall(x - HALF, y - HALF) &&
    !isWall(x + HALF, y - HALF) &&
    !isWall(x - HALF, y + HALF) &&
    !isWall(x + HALF, y + HALF)
  );
}

function getMovementMultiplier(player) {
  let multiplier = 1;

  const primaryWeight = Number(player?.loadout?.primary?.weaponDef?.handling?.weight || 0);
  const secondaryWeight = Number(player?.loadout?.secondary?.weaponDef?.handling?.weight || 0);
  const totalWeight = primaryWeight + secondaryWeight;
  multiplier *= Math.max(0.62, 1 - totalWeight * 0.08);

  if (player?.ads) multiplier *= ADS_MULTIPLIER;
  if (player?.action?.locked) {
    if (player.action.type === 'medkit') multiplier *= ACTION_MEDKIT_MULTIPLIER;
    if (player.action.type === 'bandage') multiplier *= ACTION_BANDAGE_MULTIPLIER;
    if (player.action.type === 'reload') multiplier *= ACTION_RELOAD_MULTIPLIER;
  }

  return multiplier;
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
  const speed = SPEED * getMovementMultiplier(player);
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

module.exports = { updatePlayerMovement, getMovementMultiplier, SPEED, PLAYER_HALF: HALF };
