import { getMyPlayer, getCurrentWeapon } from './network.js';
import { socket } from './netSocket.js';
import { pushPendingInput } from './pendingInputs.js';
import { moveWithCollision } from './collision.js';

const SPEED = 0.05;
let inputSeq = 0;
const keys = { w: false, a: false, s: false, d: false };
const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, down: false, rightDown: false };
let lastScrollSwitch = 0;
const SCROLL_SWITCH_COOLDOWN = 120;
let autoFireInterval = null;
window.localInputState = window.localInputState || { ads: false, firing: false };

function getCanvas() {
  return document.getElementById('game');
}

export function applyLocalMovement() {
  const p = getMyPlayer();
  if (!p) return;
  let dx = 0, dy = 0;
  if (keys.w) dy -= 1;
  if (keys.s) dy += 1;
  if (keys.a) dx -= 1;
  if (keys.d) dx += 1;
  const len = Math.hypot(dx, dy);
  if (len > 0) {
    dx /= len;
    dy /= len;
  }
  if (p.hp > 0) moveWithCollision(p, dx * SPEED, dy * SPEED);
}

function getAimDirection() {
  const canvas = getCanvas();
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const mouseX = mouse.x - rect.left;
  const mouseY = mouse.y - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  let dx = mouseX - centerX;
  let dy = mouseY - centerY;
  const len = Math.hypot(dx, dy);
  if (len <= 0) return null;
  return { dx: dx / len, dy: dy / len };
}

function canUseCombatInput() {
  const p = getMyPlayer();
  return !!p && p.hp > 0 && !p.espectador;
}

function emitAim() {
  const aim = getAimDirection();
  if (!aim) return;
  socket.emit('aim', { dx: aim.dx, dy: aim.dy, ads: mouse.rightDown });
}

function shootOnce() {
  if (!canUseCombatInput()) return;
  const p = getMyPlayer();
  const weapon = getCurrentWeapon();
  if (!p || !weapon || p.isSwitching || weapon.isReloading || weapon.ammoInMag <= 0) return;
  const aim = getAimDirection();
  if (!aim) return;
  socket.emit('shoot', { dx: aim.dx, dy: aim.dy, ads: mouse.rightDown, time: Date.now(), ping: window.myPing || 0 });
}

function startAutoFire() {
  if (autoFireInterval) return;
  window.localInputState.firing = true;
  shootOnce();
  autoFireInterval = setInterval(() => {
    const weapon = getCurrentWeapon();
    if (!mouse.down || !weapon) return;
    if (weapon.weaponId === 'pistol' || weapon.weaponId === 'shotgun' || weapon.weaponId === 'sniper') return;
    shootOnce();
  }, 80);
}

function stopAutoFire() {
  window.localInputState.firing = false;
  clearInterval(autoFireInterval);
  autoFireInterval = null;
}

function setAdsState(value) {
  const next = !!value;
  if (mouse.rightDown === next) return;
  mouse.rightDown = next;
  window.localInputState.ads = next;
  emitAim();
}

function setFireState(value) {
  const next = !!value;
  if (mouse.down === next) return;
  mouse.down = next;
  if (next) startAutoFire();
  else stopAutoFire();
}

function syncPointerButtons(event) {
  const buttons = Number(event?.buttons || 0);
  setFireState((buttons & 1) !== 0);
  setAdsState((buttons & 2) !== 0);
}

function switchTo(slot) {
  const p = getMyPlayer();
  if (!p?.loadout || p.isSwitching || p.loadout.current === slot || !p.loadout[slot]) return;
  socket.emit('switchWeapon', { slot });
}

function switchByToggle() {
  const p = getMyPlayer();
  if (!p?.loadout) return;
  switchTo(p.loadout.current === 'primary' ? 'secondary' : 'primary');
}

function requestReload() {
  if (!canUseCombatInput()) return;
  const weapon = getCurrentWeapon();
  if (!weapon || weapon.isReloading || weapon.magsLeft <= 0) return;
  socket.emit('reload');
}

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;

  switch (e.key.toLowerCase()) {
    case 'w': keys.w = true; break;
    case 's': keys.s = true; break;
    case 'a': keys.a = true; break;
    case 'd': keys.d = true; break;
    case 'r': requestReload(); break;
    case 'q': switchByToggle(); break;
    case '1': switchTo('primary'); break;
    case '2': switchTo('secondary'); break;
    case 'e':
      if (canUseCombatInput()) {
        socket.emit('pickup');
      }
      break;
    case '4':
      if (canUseCombatInput()) {
        socket.emit('useMedkit');
      }
      break;
    case '5':
      if (canUseCombatInput()) {
        socket.emit('useBandage');
      }
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key.toLowerCase()) {
    case 'w': keys.w = false; break;
    case 's': keys.s = false; break;
    case 'a': keys.a = false; break;
    case 'd': keys.d = false; break;
  }
});
function resetMovementKeys() {
  keys.w = false;
  keys.a = false;
  keys.s = false;
  keys.d = false;
}
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  syncPointerButtons(e);
  emitAim();
});

window.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('mousedown', (e) => {
  if (e.button === 2) e.preventDefault();
  syncPointerButtons(e);
  emitAim();
});

window.addEventListener('mouseup', (e) => {
  syncPointerButtons(e);
  emitAim();
});

window.addEventListener('blur', () => {
  resetMovementKeys();
  setFireState(false);
  setAdsState(false);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    resetMovementKeys();
    setFireState(false);
    setAdsState(false);
  }
});

window.addEventListener('wheel', () => {
  const now = Date.now();
  if (now - lastScrollSwitch < SCROLL_SWITCH_COOLDOWN) return;
  lastScrollSwitch = now;
  switchByToggle();
}, { passive: true });

setInterval(() => {
  const aim = getAimDirection() || { dx: 1, dy: 0 };
  const input = {
    seq: inputSeq++,
    up: keys.w,
    down: keys.s,
    left: keys.a,
    right: keys.d,
    aimDx: aim.dx,
    aimDy: aim.dy,
    ads: mouse.rightDown,
  };
  //console.log('INPUT ENVIADO:', input);
  pushPendingInput(input);
  socket.emit('input', input);
}, 50);