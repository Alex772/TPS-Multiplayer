const { players, getCurrentWeapon } = require('./players');
const { getVisibleWorldItems } = require('./items/worldItems');
const { MAP_WIDTH, MAP_HEIGHT, layers } = require('./map/mapState');
const { hasLineOfSight } = require('./map/mapCollision');
const { angleDiff } = require('./utils/math');
const { getWeapon } = require('./weapons');

const visibilityCache = new Map();

const CACHE_TTL_MS = 90;
const LOS_STEP = 0.28;
const MAX_CACHE_SIZE = 120;

function getScopeMultiplier(player, weapon) {
  const zoom = Number(player.activeScope || 1);
  const allowed = weapon?.scope?.allowed || [];
  if (zoom <= 1 || !allowed.includes(zoom)) return 1;
  return zoom;
}

function getViewerVision(viewer) {
  const weaponState = getCurrentWeapon(viewer);
  const weapon = getWeapon(weaponState?.weaponId || 'pistol');
  const scope = getScopeMultiplier(viewer, weapon);

  const baseRadius = weapon.vision.baseRadius;
  const adsMultiplier = viewer.ads ? weapon.vision.adsBonus : 1;
  const coneRange = weapon.vision.coneRange * adsMultiplier * (1 + (scope - 1) * 0.4);

  const baseAngle = weapon.vision.coneAngle;
  const minConeAngle = Number(weapon.vision.minConeAngle ?? 18);
  const coneAngle = viewer.ads
    ? Math.max(minConeAngle, baseAngle / Math.max(1, Math.sqrt(scope)))
    : baseAngle;

  const dimRadius = baseRadius + 1.0;

  return {
    baseRadius,
    dimRadius,
    coneRange,
    coneAngle,
    angle: viewer.angle || 0,
    scope,
  };
}

function canViewerSeePoint(viewer, x, y) {
  const vision = getViewerVision(viewer);

  const dx = x - viewer.x;
  const dy = y - viewer.y;
  const dist = Math.hypot(dx, dy);

  if (dist <= vision.baseRadius) {
    return hasLineOfSight(viewer.x, viewer.y, x, y, LOS_STEP);
  }

  if (dist > vision.coneRange) {
    return false;
  }

  const diff = Math.abs(angleDiff(Math.atan2(dy, dx), vision.angle));
  const halfCone = (vision.coneAngle * Math.PI / 180) / 2;

  if (diff > halfCone) {
    return false;
  }

  return hasLineOfSight(viewer.x, viewer.y, x, y, LOS_STEP);
}

function getVisibilityMask(viewer) {
  const vision = getViewerVision(viewer);
  const visible = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    visible[y] = new Array(MAP_WIDTH).fill(false);
  }

  const maxRange = Math.ceil(Math.max(vision.baseRadius, vision.coneRange)) + 1;
  const minX = Math.max(0, Math.floor(viewer.x - maxRange));
  const maxX = Math.min(MAP_WIDTH - 1, Math.ceil(viewer.x + maxRange));
  const minY = Math.max(0, Math.floor(viewer.y - maxRange));
  const maxY = Math.min(MAP_HEIGHT - 1, Math.ceil(viewer.y + maxRange));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      visible[y][x] = canViewerSeePoint(viewer, x + 0.5, y + 0.5);
    }
  }

  return visible;
}

function getVisibilityCacheKey(viewer) {
  const vision = getViewerVision(viewer);
  const angleBucket = Math.round((viewer.angle || 0) * 10) / 10;
  const xBucket = Math.round(viewer.x * 4) / 4;
  const yBucket = Math.round(viewer.y * 4) / 4;

  return [
    xBucket,
    yBucket,
    angleBucket,
    viewer.ads ? 1 : 0,
    vision.baseRadius,
    vision.coneRange,
    vision.coneAngle,
    viewer.loadout?.current || 'none',
    viewer.activeScope || 1,
  ].join('|');
}

function getCachedVisibilityMask(viewer) {
  const now = Date.now();
  const cacheKey = getVisibilityCacheKey(viewer);
  const cached = visibilityCache.get(cacheKey);

  if (cached && (now - cached.time) <= CACHE_TTL_MS) {
    return cached.mask;
  }

  const visibleMask = getVisibilityMask(viewer);

  visibilityCache.set(cacheKey, {
    mask: visibleMask,
    time: now,
  });

  if (visibilityCache.size > MAX_CACHE_SIZE) {
    const firstKey = visibilityCache.keys().next().value;
    visibilityCache.delete(firstKey);
  }

  return visibleMask;
}

function sanitizePlayerForViewer(_viewer, target) {
  const currentWeapon = getCurrentWeapon(target);

  return {
    id: target.id,
    x: target.x,
    y: target.y,
    hp: target.hp,
    hit: target.hit,
    angle: target.angle,
    aim: target.aim,
    ads: target.ads,
    activeScope: target.activeScope,
    inventory: target.inventory,
    espectador: target.espectador,
    loadout: {
      primary: target.loadout.primary,
      secondary: target.loadout.secondary,
      current: target.loadout.current,
    },
    isSwitching: target.isSwitching,
    switchEndTime: target.switchEndTime,
    nextWeapon: target.nextWeapon,
    lastShot: target.lastShot,
    lastProcessedInput: target.lastProcessedInput || 0,
    visibility: getViewerVision(target),
    currentWeaponId: currentWeapon?.weaponId || null,
  };
}

function buildStateForPlayer(playerId, bullets) {
  const viewer = players[playerId];
  if (!viewer) return null;

  const visibleMask = getCachedVisibilityMask(viewer);
  const playersToSend = {};

  for (const [id, target] of Object.entries(players)) {
    if (!target) continue;

    if (id === playerId || canViewerSeePoint(viewer, target.x, target.y)) {
      playersToSend[id] = sanitizePlayerForViewer(viewer, target);
    }
  }

  const filteredBullets = (bullets || []).filter((b) =>
    canViewerSeePoint(viewer, b.x, b.y)
  );

  const items = getVisibleWorldItems().filter((item) =>
    canViewerSeePoint(viewer, item.x, item.y)
  );

  return {
    players: playersToSend,
    bullets: filteredBullets,
    map: {
      collision: layers.collision,
      interactive: layers.interactive,
      items,
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
    },
    visibilityMask: visibleMask,
    vision: getViewerVision(viewer),
    me: sanitizePlayerForViewer(viewer, viewer),
  };
}

module.exports = {
  buildStateForPlayer,
  canViewerSeePoint,
  getViewerVision,
};