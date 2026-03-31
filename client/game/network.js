import { getPendingInputs } from './pendingInputs.js';
import { socket } from './netSocket.js';

const SPEED = 0.05;
const LERP_OTHER = 0.22;
const LERP_CORRECTION = 0.16;
const LERP_BULLET = 0.35;

window.myPing = 0;
window.state = { players: {}, bullets: [], map: null, visibilityMask: [], vision: null, me: null };
window.serverState = { players: {}, bullets: [], map: null, visibilityMask: [], vision: null, me: null };
window.myId = null;

socket.on('connect', () => console.log('✅ conectado no servidor'));

socket.on('init', (data) => {
  window.myId = data.id;
  if (data.state) {
    window.state = structuredClone(data.state);
    window.serverState = structuredClone(data.state);
  }
});

socket.on('state', (data) => {
  window.serverState = structuredClone(data);
});

export function interpolate() {
  const me = window.myId;
  if (!me || !window.serverState?.players) return;

  const pendingInputs = getPendingInputs();

  for (const id in window.serverState.players) {
    const server = window.serverState.players[id];

    if (!window.state.players[id]) {
      window.state.players[id] = structuredClone(server);
      continue;
    }

    const local = window.state.players[id];

    // guarda a posição local atual antes de copiar o resto do estado
    let predictedX = local.x;
    let predictedY = local.y;

    if (id === me) {
      predictedX += (server.x - predictedX) * LERP_CORRECTION;
      predictedY += (server.y - predictedY) * LERP_CORRECTION;

      const lastProcessed = server.lastProcessedInput ?? 0;

      while (pendingInputs.length > 0 && pendingInputs[0].seq <= lastProcessed) {
        pendingInputs.shift();
      }

      for (const input of pendingInputs) {
        let dx = 0;
        let dy = 0;

        if (input.up) dy -= 1;
        if (input.down) dy += 1;
        if (input.left) dx -= 1;
        if (input.right) dx += 1;

        const len = Math.hypot(dx, dy);
        if (len > 0) {
          predictedX += (dx / len) * SPEED;
          predictedY += (dy / len) * SPEED;
        }
      }
    } else {
      predictedX += (server.x - predictedX) * LERP_OTHER;
      predictedY += (server.y - predictedY) * LERP_OTHER;
    }

    // copia o resto do estado do servidor
    Object.assign(local, structuredClone(server));

    // restaura a posição interpolada/predita
    local.x = predictedX;
    local.y = predictedY;
  }

  for (const id in window.state.players) {
    if (!window.serverState.players[id]) delete window.state.players[id];
  }

  const localMap = new Map((window.state.bullets || []).filter(Boolean).map((b) => [b.id, b]));
  window.state.bullets = (window.serverState.bullets || []).map((sb) => {
    const lb = localMap.get(sb.id);
    if (!lb) return { ...sb };
    lb.x += (sb.x - lb.x) * LERP_BULLET;
    lb.y += (sb.y - lb.y) * LERP_BULLET;
    lb.dx = sb.dx;
    lb.dy = sb.dy;
    return lb;
  });

  window.state.map = structuredClone(window.serverState.map);
  window.state.visibilityMask = structuredClone(window.serverState.visibilityMask);
  window.state.vision = structuredClone(window.serverState.vision);
  window.state.me = structuredClone(window.serverState.me);
}

export function getMyPlayer() {
  return window.state?.players?.[window.myId] || null;
}

export function getCurrentWeapon() {
  const p = getMyPlayer();
  return p?.loadout?.[p?.loadout?.current] || null;
}

setInterval(() => socket.emit('pingCheck', Date.now()), 1000);

let lastPing = 0;
socket.on('pongCheck', (start) => {
  //const me = window.myId;
  //console.log('[CLIENT state]', me ? data?.players?.[me] : data);
  const ping = Date.now() - start;
  window.myPing = lastPing * 0.7 + ping * 0.3;
  lastPing = window.myPing;
});