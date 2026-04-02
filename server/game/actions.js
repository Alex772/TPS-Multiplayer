function ensureActionState(player) {
  if (!player.action) {
    player.action = {
      type: null,
      startedAt: 0,
      endAt: 0,
      locked: false,
      meta: null,
    };
  }
  return player.action;
}

function startAction(player, type, durationMs, meta = null, now = Date.now()) {
  const action = ensureActionState(player);
  if (action.locked) return false;

  action.type = type;
  action.startedAt = now;
  action.endAt = now + Math.max(0, Number(durationMs) || 0);
  action.locked = true;
  action.meta = meta;
  return true;
}

function clearAction(player) {
  const action = ensureActionState(player);
  action.type = null;
  action.startedAt = 0;
  action.endAt = 0;
  action.locked = false;
  action.meta = null;
}

function isActionLocked(player) {
  return !!ensureActionState(player).locked;
}

module.exports = {
  ensureActionState,
  startAction,
  clearAction,
  isActionLocked,
};
