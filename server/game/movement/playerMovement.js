// server/game/movement/playerMovement.js

const { isWall, MAP_WIDTH, MAP_HEIGHT } = require("../map");

const SPEED = 0.05;

function updatePlayerMovement(player) {
    if (!player || !player.input) return;

    let dx = 0;
    let dy = 0;

    if (player.input.up) dy -= 1;
    if (player.input.down) dy += 1;
    if (player.input.left) dx -= 1;
    if (player.input.right) dx += 1;

    const len = Math.hypot(dx, dy);
    if (len > 0) {
        dx /= len;
        dy /= len;
    }

    const newX = player.x + dx * SPEED;
    const newY = player.y + dy * SPEED;

    // morto = modo fantasma
    if (player.hp <= 0) {
        if (newX >= 0 && newX <= MAP_WIDTH) player.x = newX;
        if (newY >= 0 && newY <= MAP_HEIGHT) player.y = newY;
        return;
    }

    if (!isWall(newX, player.y)) player.x = newX;
    if (!isWall(player.x, newY)) player.y = newY;
}

module.exports = { updatePlayerMovement };