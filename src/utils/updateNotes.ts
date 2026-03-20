export interface UpdateNotesCache {
  version: string;
  body: string;
  checkedAt: number;
}

const UPDATE_NOTES_CACHE_KEY = 'firewood.updateNotesCache';
const RELEASE_NOTES_CACHE_PREFIX = 'firewood.releaseNotesCache.';
const RELEASE_NOTES_TTL_MS = 2 * 60 * 1000;

interface ReleaseNotesResult {
  version: string;
  body: string;
}

const memoryReleaseNotesCache = new Map<string, { expiresAt: number; data: ReleaseNotesResult }>();
const inFlightReleaseNotes = new Map<string, Promise<ReleaseNotesResult>>();

/** 只保留 release notes 中变更说明部分，去掉下载/安装说明 */
export function extractChangelog(body: string | null): string {
  if (!body) return '包含最新功能与问题修复。';
  const cutoff = body.search(/^---+$/m);
  const section = cutoff > 0 ? body.slice(0, cutoff) : body;
  return section.trim();
}

export function cacheUpdateNotes(data: UpdateNotesCache) {
  try {
    localStorage.setItem(UPDATE_NOTES_CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function readUpdateNotesCache(): UpdateNotesCache | null {
  try {
    const raw = localStorage.getItem(UPDATE_NOTES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UpdateNotesCache;
    if (!parsed.version || !parsed.body) return null;
    return parsed;
  } catch {
    return null;
  }
}

function normalizeVersion(version: string) {
  return version.replace(/^v/, '').trim();
}

function readReleaseNotesCache(version: string): UpdateNotesCache | null {
  try {
    const key = `${RELEASE_NOTES_CACHE_PREFIX}${normalizeVersion(version)}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UpdateNotesCache;
    if (!parsed.version || !parsed.body || !parsed.checkedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeReleaseNotesCache(version: string, body: string) {
  const normalized = normalizeVersion(version);
  const cache: UpdateNotesCache = {
    version: normalized,
    body,
    checkedAt: Date.now(),
  };
  try {
    localStorage.setItem(`${RELEASE_NOTES_CACHE_PREFIX}${normalized}`, JSON.stringify(cache));
  } catch {
    // ignore storage errors
  }
}

export async function fetchReleaseNotesByVersionCached(version: string): Promise<ReleaseNotesResult> {
  const normalized = normalizeVersion(version);
  const now = Date.now();

  const memoryHit = memoryReleaseNotesCache.get(normalized);
  if (memoryHit && memoryHit.expiresAt > now) {
    return memoryHit.data;
  }

  const storageHit = readReleaseNotesCache(normalized);
  if (storageHit && storageHit.checkedAt + RELEASE_NOTES_TTL_MS > now) {
    const data: ReleaseNotesResult = { version: storageHit.version, body: storageHit.body };
    memoryReleaseNotesCache.set(normalized, { data, expiresAt: storageHit.checkedAt + RELEASE_NOTES_TTL_MS });
    return data;
  }

  const inflight = inFlightReleaseNotes.get(normalized);
  if (inflight) {
    return inflight;
  }

  const request = (async () => {
    const tag = `v${normalized}`;
    const resp = await fetch(`https://api.github.com/repos/ifmagic/firewood/releases/tags/${tag}`);
    if (!resp.ok) {
      throw new Error(`release ${tag} not found`);
    }
    const data = (await resp.json()) as { body?: string; tag_name?: string };
    const resolvedVersion = (data.tag_name || tag).replace(/^v/, '');
    const changelog = extractChangelog(data.body ?? null);
    const result: ReleaseNotesResult = {
      version: resolvedVersion,
      body: changelog,
    };

    memoryReleaseNotesCache.set(normalized, {
      data: result,
      expiresAt: Date.now() + RELEASE_NOTES_TTL_MS,
    });
    writeReleaseNotesCache(normalized, changelog);
    return result;
  })();

  inFlightReleaseNotes.set(normalized, request);
  try {
    return await request;
  } finally {
    inFlightReleaseNotes.delete(normalized);
  }
}
