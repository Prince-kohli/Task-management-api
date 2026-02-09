const crypto = require('crypto');

const memory = new Map();
const memoryTeamKeys = new Map();

function nowMs() {
  return Date.now();
}

function stableStringify(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

function makeKey(teamId, query) {
  const hash = crypto.createHash('sha1').update(stableStringify(query)).digest('hex');
  return `tasks:list:${teamId}:${hash}`;
}

async function getCached(teamId, query) {
  const key = makeKey(teamId, query);

  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= nowMs()) {
    memory.delete(key);
    return null;
  }
  return entry.value;
}

async function setCached(teamId, query, value, ttlSeconds = 30) {
  const key = makeKey(teamId, query);

  memory.set(key, { value, expiresAt: nowMs() + ttlSeconds * 1000 });
  if (!memoryTeamKeys.has(teamId)) memoryTeamKeys.set(teamId, new Set());
  memoryTeamKeys.get(teamId).add(key);
}

async function invalidateTeam(teamId) {
  const keys = memoryTeamKeys.get(teamId);
  if (keys) {
    for (const k of keys.values()) memory.delete(k);
  }
  memoryTeamKeys.delete(teamId);
}

module.exports = { getCached, setCached, invalidateTeam };
