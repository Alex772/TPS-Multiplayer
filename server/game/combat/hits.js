// server/game/combat/hits.js

const { players } = require("../players");

const HIT_RADIUS = 0.4;

function tryHitPlayers(bullet, removeBullet) {
    for (let id in players) {
        const realPlayer = players[id];
        const snapshotPlayer = bullet.snapshotPlayers?.[id] || realPlayer;

        if (!realPlayer || !snapshotPlayer) continue;
        if (id === bullet.owner) continue;
        if (realPlayer.espectador) continue;
        if (realPlayer.hp <= 0) continue;

        const dx = snapshotPlayer.x - bullet.x;
        const dy = snapshotPlayer.y - bullet.y;
        const dist = Math.hypot(dx, dy);

        if (dist >= HIT_RADIUS) continue;

        applyDamage(realPlayer, bullet.owner, bullet.damage);

        removeBullet();
        return true;
    }

    return false;
}

function applyDamage(target, ownerId, damage) {
    target.hp -= damage;

    const owner = players[ownerId];
    if (owner) owner.hit = true;

    if (target.hp > 0) return;

    target.hp = 0;
    target.espectador = true;

    console.log("☠️ jogador morreu:", target.id);
}

module.exports = { tryHitPlayers };