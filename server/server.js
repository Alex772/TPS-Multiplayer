const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { players, addPlayer, removePlayer, getCurrentWeapon, switchWeapon, setPlayerAim } = require('./game/players');
const { handleShoot, bullets } = require('./game/bullets');
const { gameLoop } = require('./game/core/gameLoop');
const { buildStateForPlayer } = require('./game/visibility');
const { mapData } = require('./game/map/mapState');
const { getWeapon } = require('./game/weapons');
const { normalize } = require('./game/utils/math');
const { tryPickupItemOnPlayerTile } = require('./game/items/pickups');

const app = express();
app.use(express.static(path.resolve(__dirname, '../client')));
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, map: mapData.name, players: Object.keys(players).length, bullets: bullets.length });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

function getPlayerOrNull(socketId) {
  return players[socketId] || null;
}

function handleInput(socket, data) {
  const player = getPlayerOrNull(socket.id);
  if (!player || typeof data?.seq !== 'number') return;

  const now = Date.now();
  player.lastInput = now;

  player.input = {
    seq: data.seq,
    up: !!data.up,
    down: !!data.down,
    left: !!data.left,
    right: !!data.right,
  };

  if (Number.isFinite(data?.aimDx) && Number.isFinite(data?.aimDy)) {
    const dir = normalize(Number(data.aimDx), Number(data.aimDy));
    setPlayerAim(player, dir.dx, dir.dy, !!data.ads);
  }
}

function handleAim(socket, data) {
  const player = getPlayerOrNull(socket.id);
  if (!player) return;

  const dir = normalize(Number(data?.dx), Number(data?.dy));
  setPlayerAim(player, dir.dx, dir.dy, !!data?.ads);
}

function handleShootRequest(socket, data) {
  const player = getPlayerOrNull(socket.id);
  if (!player || player.hp <= 0 || player.espectador) return;

  const dir = normalize(Number(data?.dx), Number(data?.dy));
  if (dir.len === 0) return;

  setPlayerAim(player, dir.dx, dir.dy, !!data?.ads);
  handleShoot(socket.id, {
    dx: dir.dx,
    dy: dir.dy,
    time: Number(data?.time),
    ping: Number(data?.ping) || 0
  });
}

function handleReloadRequest(socket) {
  const player = getPlayerOrNull(socket.id);
  if (!player || player.hp <= 0 || player.espectador) return;
  if (player.isSwitching) return;

  const weaponState = getCurrentWeapon(player);
  if (!weaponState) return;

  const weapon = getWeapon(weaponState.weaponId);
  if (!weapon) return;

  if (
    weaponState.isReloading ||
    weaponState.magsLeft <= 0 ||
    weaponState.ammoInMag >= weapon.magSize
  ) {
    return;
  }

  weaponState.isReloading = true;
  weaponState.reloadEndTime = Date.now() + weapon.reloadTime;
}

function handleSwitchWeaponRequest(socket, data) {
  const player = getPlayerOrNull(socket.id);
  if (!player || player.hp <= 0 || player.espectador) return;
  switchWeapon(player, data?.slot);
}

function handlePickupRequest(socket) {
  const player = getPlayerOrNull(socket.id);
  if (!player || player.hp <= 0 || player.espectador) return;

  tryPickupItemOnPlayerTile(player, Date.now());
}

function sendInit(socket) {
  socket.emit('init', {
    id: socket.id,
    state: buildStateForPlayer(socket.id, bullets),
    mapMeta: {
      id: mapData.id,
      name: mapData.name,
      width: mapData.width,
      height: mapData.height
    },
  });
}

io.on('connection', (socket) => {
  console.log('🟢 Player conectou:', socket.id);

  addPlayer(socket.id);
  sendInit(socket);

  socket.on('input', (data) => handleInput(socket, data));
  socket.on('aim', (data) => handleAim(socket, data));
  socket.on('shoot', (data) => handleShootRequest(socket, data));
  socket.on('reload', () => handleReloadRequest(socket));
  socket.on('switchWeapon', (data) => handleSwitchWeaponRequest(socket, data));
  socket.on('pickup', () => handlePickupRequest(socket));
  socket.on('pingCheck', (time) => socket.emit('pongCheck', time));

  socket.on('disconnect', () => {
    console.log('🔴 Player saiu:', socket.id);
    removePlayer(socket.id);
  });
});

gameLoop(io);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});