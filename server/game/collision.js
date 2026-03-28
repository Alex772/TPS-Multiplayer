function checkHit(bullet, player) {
    let dx = bullet.x - player.x;
    let dy = bullet.y - player.y;

    return Math.sqrt(dx*dx + dy*dy) < 0.5;
}

module.exports = { checkHit };