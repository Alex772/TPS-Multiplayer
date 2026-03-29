const PLAYER_SIZE = 0.1;
const HALF = PLAYER_SIZE / 2;

export function isWall(x, y) {
    const map = window.state.map;

    const tileX = Math.floor(x);
    const tileY = Math.floor(y);

    if (!map[tileY] || !map[tileY][tileX]) return true;

    return map[tileY][tileX] === 1;
}

export function moveWithCollision(p, dx, dy) {

    let nextX = p.x + dx;
    let nextY = p.y + dy;

    // X
    if (
        !isWall(nextX - HALF.y - HALF) &&
        !isWall(nextX + HALF.y - HALF) &&
        !isWall(nextX - HALF.y + HALF) &&
        !isWall(nextX + HALF.y + HALF)
    ) {
        p.x = nextX;
    }

    // Y
    if (
        !isWall(p.x - HALF, nextY - HALF) &&
        !isWall(p.x + HALF, nextY - HALF) &&
        !isWall(p.x - HALF, nextY + HALF) &&
        !isWall(p.x + HALF, nextY + HALF)
    ) {
        p.y = nextY;
    }
}