const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

const TILE_SIZE_BASE = 50;

function formatWeaponName(weaponId) {
  const names = {
    pistol: 'Pistol',
    rifle: 'Rifle',
    smg: 'SMG',
    shotgun: 'Shotgun',
    sniper: 'Sniper'
  };
  return names[weaponId] || weaponId || 'Sem arma';
}

function formatItemName(itemId) {
  const names = {
    scope_2x: 'Mira 2x',
    scope_4x: 'Mira 4x',
    scope_8x: 'Mira 8x',
    weapon_pistol: 'Pistol',
    weapon_rifle: 'Rifle',
    weapon_smg: 'SMG',
    weapon_shotgun: 'Shotgun',
    weapon_sniper: 'Sniper',
    ammo_light: 'Munição leve',
    ammo_shells: 'Cartuchos',
    ammo_sniper: 'Munição de sniper',
    medkit: 'Medkit',
    bandage: 'Bandagem',
    vest_light: 'Colete leve'
  };

  return names[itemId] || itemId || 'Item';
}

function getCurrentWeaponState(player) {
  return player?.loadout?.[player?.loadout?.current] || null;
}

function tileVisible(mask, x, y) {
  return !!mask?.[y]?.[x];
}

function worldToScreen(x, y, camX, camY, tileSize) {
  return {
    x: (x - camX) * tileSize + canvas.width / 2,
    y: (y - camY) * tileSize + canvas.height / 2,
  };
}

function drawVisibilityCone(camX, camY, me, vision, tileSize) {
  if (!vision) return;
  const center = worldToScreen(me.x, me.y, camX, camY, tileSize);
  const halfAngle = ((vision.coneAngle || 90) * Math.PI / 180) / 2;
  const rangePx = (vision.coneRange || 10) * tileSize;

  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.arc(center.x, center.y, rangePx, me.angle - halfAngle, me.angle + halfAngle);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function isSameTile(a, b) {
  return Math.floor(a.x) === Math.floor(b.x) && Math.floor(a.y) === Math.floor(b.y);
}

function getItemOnPlayerTile(player, items) {
  if (!player || !items?.length) return null;
  return items.find((item) => isSameTile(player, item)) || null;
}

function getActionProgress(action) {
  if (!action?.locked) return 0;
  const startedAt = Number(action.startedAt || 0);
  const endAt = Number(action.endAt || 0);
  const total = Math.max(1, endAt - startedAt);
  const elapsed = Math.max(0, Date.now() - startedAt);
  return Math.max(0, Math.min(1, elapsed / total));
}

function formatActionLabel(action) {
  const labels = {
    reload: 'Recarregando',
    medkit: 'Usando medkit',
    bandage: 'Usando bandagem'
  };
  return labels[action?.type] || action?.type || 'Ação';
}

export function render(state, myId) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const me = state.players?.[myId];
  if (!me || !state.map) return;

  const localAds = myId === window.myId ? (!!window.localInputState?.ads && !!me.inventory?.scope && me.hp > 0 && !me.espectador) : !!me.ads;
  const zoom = localAds ? Math.max(1, state.vision?.zoomFactor || 1) : 1;
  const tileSize = TILE_SIZE_BASE * Math.min(2.4, 1 + (zoom - 1) * 0.18);
  const camX = me.x;
  const camY = me.y;
  const mask = state.visibilityMask || [];
  const map = state.map;

  const h = map.height || map.collision.length;
  const w = map.width || map.collision[0].length;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pos = worldToScreen(x, y, camX, camY, tileSize);
      const visible = tileVisible(mask, x, y);
      const collision = map.collision?.[y]?.[x] || 0;
      const interactive = map.interactive?.[y]?.[x] || 0;

      ctx.fillStyle = visible ? '#20252b' : '#0a0d10';
      ctx.fillRect(pos.x, pos.y, tileSize, tileSize);

      if (visible) {
        if (collision === 1) {
          ctx.fillStyle = '#575d66';
          ctx.fillRect(pos.x, pos.y, tileSize, tileSize);
        }
        if (interactive === 2) {
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(pos.x + 6, pos.y + 6, tileSize - 12, tileSize - 12);
        } else if (interactive === 3) {
          ctx.fillStyle = '#4b6a88';
          ctx.fillRect(pos.x + 4, pos.y + 8, tileSize - 8, tileSize - 16);
        }
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.strokeRect(pos.x, pos.y, tileSize, tileSize);
    }
  }

  drawVisibilityCone(camX, camY, { ...me, ads: localAds }, state.vision, tileSize);

  for (const item of map.items || []) {
    const pos = worldToScreen(item.x, item.y, camX, camY, tileSize);
    const colors = {
      scope_2x: '#7CFC00',
      scope_4x: '#00CED1',
      scope_8x: '#FF69B4',
      weapon_rifle: '#FFD700',
      weapon_smg: '#FFB347',
      weapon_shotgun: '#F4A460',
      weapon_sniper: '#87CEFA',
      weapon_pistol: '#D8BFD8',
      ammo_light: '#F0E68C',
      ammo_shells: '#DEB887',
      ammo_sniper: '#B0C4DE',
      medkit: '#FF6B6B',
      bandage: '#F5DEB3',
      vest_light: '#4DA3FF'
    };

    ctx.fillStyle = colors[item.id] || '#fff';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, Math.max(5, tileSize * 0.12), 0, Math.PI * 2);
    ctx.fill();
  }

  for (const [id, p] of Object.entries(state.players || {})) {
    const pos = worldToScreen(p.x, p.y, camX, camY, tileSize);
    const size = Math.max(10, tileSize * 0.22);
    ctx.save();
    if (p.hp <= 0 || p.espectador) ctx.globalAlpha = 0.45;
    ctx.fillStyle = id === myId ? '#3ea6ff' : '#ff5c5c';
    ctx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);

    const armLen = size * 0.9;
    ctx.strokeStyle = id === myId ? '#9bd3ff' : '#ffc0c0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + Math.cos(p.angle || 0) * armLen, pos.y + Math.sin(p.angle || 0) * armLen);
    ctx.stroke();

    const barWidth = size * 1.8;
    const hpRatio = Math.max(0, Math.min(1, (p.hp ?? 0) / 100));
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(pos.x - barWidth / 2, pos.y - size - 10, barWidth, 5);
    ctx.fillStyle = hpRatio > 0.5 ? '#32CD32' : hpRatio > 0.25 ? '#FFD700' : '#FF4D4D';
    ctx.fillRect(pos.x - barWidth / 2, pos.y - size - 10, barWidth * hpRatio, 5);
    ctx.restore();
  }

  for (const b of state.bullets || []) {
    const pos = worldToScreen(b.x, b.y, camX, camY, tileSize);
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ffb347';
    ctx.fillRect(pos.x - 2, pos.y - 2, 8, 8);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ff5f1f';
    ctx.fillRect(pos.x, pos.y, 4, 4);
  }

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  ctx.strokeStyle = 'white';
  ctx.lineWidth = localAds ? 1 : 2;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy); ctx.lineTo(cx - 2, cy);
  ctx.moveTo(cx + 2, cy); ctx.lineTo(cx + 8, cy);
  ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy - 2);
  ctx.moveTo(cx, cy + 2); ctx.lineTo(cx, cy + 8);
  ctx.stroke();

  if (localAds && zoom > 1) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(canvas.width, canvas.height) * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const itemOnTile = getItemOnPlayerTile(me, map.items || []);
  if (itemOnTile) {
    const boxWidth = 320;
    const boxHeight = 62;
    const boxX = canvas.width / 2 - boxWidth / 2;
    const boxY = canvas.height - 205;

    ctx.fillStyle = 'rgba(0,0,0,0.60)';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Pressione E para pegar', boxX + 48, boxY + 25);

    ctx.font = '16px Arial';
    ctx.fillText(formatItemName(itemOnTile.id), boxX + 48, boxY + 48);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.48)';
  ctx.fillRect(14, canvas.height - 140, 390, 120);
  ctx.fillStyle = '#fff';
  ctx.font = '18px Arial';
  const currentWeapon = getCurrentWeaponState(me);
  const vest = me.inventory?.vest || null;
  const vestText = vest ? `${Math.ceil(vest.durability)}/${Math.ceil(vest.maxDurability)}` : 'Sem colete';
  ctx.fillText(`Arma: ${formatWeaponName(currentWeapon?.weaponId)}`, 24, canvas.height - 108);
  ctx.fillText(`Munição: ${currentWeapon?.ammoInMag ?? 0}/${currentWeapon?.magsLeft ?? 0}`, 24, canvas.height - 82);
  const scopeDef = me.inventory?.scope ? formatItemName(me.inventory.scope) : 'Sem mira';
  const adsMode = me.ads && me.inventory?.scope ? `${scopeDef}` : 'Sem ADS ativo';
  ctx.fillText(`ADS atual: ${adsMode}`, 24, canvas.height - 56);
  ctx.fillText(`Mira equipada: ${scopeDef}`, 24, canvas.height - 30);
  ctx.fillText(`HP: ${Math.max(0, me.hp ?? 0)}`, 220, canvas.height - 108);
  ctx.fillText(`Medkits: ${me.inventory?.meds ?? 0}`, 220, canvas.height - 82);
  ctx.fillText(`Bandagens: ${me.inventory?.bandages ?? 0}`, 220, canvas.height - 56);
  ctx.fillText(`Colete: ${vestText}`, 220, canvas.height - 30);
  ctx.fillText(`Ping: ${Math.round(window.myPing || 0)}ms`, 220, canvas.height - 4);
  ctx.fillText(`ADS: ${localAds ? 'Ligado' : 'Desligado'}`, 220, canvas.height - 152);
  ctx.fillText(`Mapa: ${window.mapMeta?.name || '---'}`, 24, canvas.height - 4);
  if (me.action?.locked) {
    const actionProgress = getActionProgress(me.action);
    const barX = 24;
    const barY = canvas.height - 175;
    const barW = 180;
    const barH = 10;

    ctx.fillText(`Ação: ${formatActionLabel(me.action)}`, 24, canvas.height - 152);
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#6ee7ff';
    ctx.fillRect(barX, barY, barW * actionProgress, barH);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.strokeRect(barX, barY, barW, barH);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.50)';
  ctx.fillRect(canvas.width - 350, canvas.height - 130, 330, 110);
  ctx.fillStyle = '#fff';
  ctx.font = '15px Arial';
  ctx.fillText('Q / Scroll = trocar arma', canvas.width - 336, canvas.height - 94);
  ctx.fillText('R = recarregar | botão direito = ADS (exige mira)', canvas.width - 336, canvas.height - 68);
  ctx.fillText('E = pegar item no tile atual', canvas.width - 336, canvas.height - 42);
  ctx.fillText('4 = usar medkit | 5 = bandagem', canvas.width - 336, canvas.height - 16);

  if (me.hp <= 0 || me.espectador) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(canvas.width / 2 - 170, 30, 340, 60);
    ctx.fillStyle = '#FF6666';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('VOCÊ FOI ELIMINADO - RESPawn EM BREVE', canvas.width / 2 - 155, 68);
  }
}