const JIKAN_BASE = "https://api.jikan.moe/v4";

// Two-tier cache:
//   1. In-memory Map — instant, lasts for the SPA session
//   2. localStorage  — survives reloads AND tab close (so repeat visits load
//                      from cache with zero API calls). Capped at ~5MB across
//                      the origin; we self-evict our own namespace on quota.
const memoryCache = new Map();
const inflight = new Map();
const TTL_MS = 1000 * 60 * 60 * 6; // 6 hours — Jikan data changes slowly and
                                   // persisted cache means returning visitors
                                   // get instant loads.
const STORAGE_KEY = "jikan_cache_v1";

const storage = (() => {
  try {
    if (typeof localStorage === "undefined") return null;
    localStorage.setItem(`${STORAGE_KEY}__probe`, "1");
    localStorage.removeItem(`${STORAGE_KEY}__probe`);
    return localStorage;
  } catch {
    return null;
  }
})();

function readStorageRaw(path) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(`${STORAGE_KEY}:${path}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function readStorage(path) {
  const parsed = readStorageRaw(path);
  if (!parsed) return null;
  if (Date.now() - parsed.t > TTL_MS) return null;
  return parsed;
}

function writeStorage(path, entry) {
  if (!storage) return;
  try {
    storage.setItem(`${STORAGE_KEY}:${path}`, JSON.stringify(entry));
  } catch {
    // Quota exceeded — clear our cache namespace and try once more silently.
    try {
      for (let i = storage.length - 1; i >= 0; i -= 1) {
        const key = storage.key(i);
        if (key && key.startsWith(`${STORAGE_KEY}:`)) storage.removeItem(key);
      }
      storage.setItem(`${STORAGE_KEY}:${path}`, JSON.stringify(entry));
    } catch {
      /* give up — memory cache still works */
    }
  }
}

// One-time idle cleanup: evict entries that are way past their TTL so we
// don't carry decade-old cache forever and risk hitting quota.
if (storage && typeof window !== "undefined") {
  const runCleanup = () => {
    try {
      const cutoff = Date.now() - TTL_MS * 4; // 4× TTL = 24h
      for (let i = storage.length - 1; i >= 0; i -= 1) {
        const key = storage.key(i);
        if (!key || !key.startsWith(`${STORAGE_KEY}:`)) continue;
        const raw = storage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (!parsed?.t || parsed.t < cutoff) storage.removeItem(key);
        } catch {
          storage.removeItem(key);
        }
      }
    } catch {
      /* ignore */
    }
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(runCleanup, { timeout: 4000 });
  } else {
    setTimeout(runCleanup, 3000);
  }
}

// ---------------------------------------------------------------------------
// Global rate limiter — Jikan caps us at 3 req/sec AND 60 req/min. Across the
// whole SPA every fetch goes through this queue so concurrent components
// (Home loads top + featured TV + featured Films + character rail + best-of
// slider simultaneously) can't burst past those caps.
//
// Key design decision: WE NEVER LET A REQUEST WAIT MORE THAN ~2 SECONDS IN
// THE QUEUE. If the queue is congested or we've hit the per-minute window
// cap, we fail-fast with a synthetic 429 so the caller can fall back to
// stale cache instantly instead of hanging the UI for 60+ seconds. This is
// the single most important change for perceived page-load speed.
// ---------------------------------------------------------------------------
const MAX_CONCURRENT = 3;
const MIN_GAP_MS = 340; // ≈ 2.94 req/s burst — safely under 3/s ceiling
const WINDOW_MS = 60_000;
const WINDOW_LIMIT = 55; // stay under 60/min hard cap
const MAX_QUEUE_WAIT_MS = 2500; // give up rather than block UI for ages
const REQUEST_TIMEOUT_MS = 7000; // hard wall-clock per single fetch

const queue = [];
const recentStarts = [];
let active = 0;
let lastStart = 0;
let pumpTimer = null;

function schedule(task) {
  return new Promise((resolve, reject) => {
    const entry = { task, resolve, reject, enqueuedAt: Date.now() };
    queue.push(entry);
    pump();
  });
}

function pump() {
  if (pumpTimer) {
    clearTimeout(pumpTimer);
    pumpTimer = null;
  }
  while (active < MAX_CONCURRENT && queue.length > 0) {
    const now = Date.now();
    // Drop expired window entries.
    while (recentStarts.length && now - recentStarts[0] > WINDOW_MS) {
      recentStarts.shift();
    }
    let wait = 0;
    if (now - lastStart < MIN_GAP_MS) {
      wait = Math.max(wait, MIN_GAP_MS - (now - lastStart));
    }
    if (recentStarts.length >= WINDOW_LIMIT) {
      wait = Math.max(wait, WINDOW_MS - (now - recentStarts[0]) + 100);
    }
    // Bail out early if every pending request has already been queued long
    // enough that running them now would exceed MAX_QUEUE_WAIT_MS. Reject
    // them with a soft "rate-limited" signal so jget() can serve stale.
    if (wait > 0) {
      const head = queue[0];
      if (head && now - head.enqueuedAt + wait > MAX_QUEUE_WAIT_MS) {
        const expired = queue.shift();
        const err = new Error("Jikan queue wait exceeded — try stale cache");
        err.code = "QUEUE_TIMEOUT";
        expired.reject(err);
        continue;
      }
      pumpTimer = setTimeout(pump, wait);
      return;
    }
    const { task, resolve, reject } = queue.shift();
    active += 1;
    lastStart = now;
    recentStarts.push(now);
    Promise.resolve()
      .then(task)
      .then(resolve, reject)
      .finally(() => {
        active -= 1;
        pump();
      });
  }
}

// Fetch with retry — honors Retry-After header (capped at 2s), exponential
// backoff with jitter on 429 / 5xx. Retries are aggressive but SHORT — total
// wall-clock per `fetchWithRetry` is capped around ~3 seconds so a flaky
// endpoint never freezes a page.
async function fetchWithRetry(path) {
  const maxAttempts = 2; // first try + 1 retry
  let attempt = 0;
  while (true) {
    // Per-request timeout via AbortController. Without this, fetch() can
    // legitimately hang for 30+ seconds before the browser gives up.
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(new Error("request timeout")),
      REQUEST_TIMEOUT_MS
    );
    let res;
    try {
      res = await fetch(`${JIKAN_BASE}${path}`, { signal: controller.signal });
    } catch (networkErr) {
      clearTimeout(timeoutId);
      // Network failure / timeout. One quick retry, then give up.
      if (attempt < maxAttempts) {
        attempt += 1;
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
        continue;
      }
      throw networkErr;
    }
    clearTimeout(timeoutId);
    if (res.ok) return res.json();

    const retryable = res.status === 429 || (res.status >= 500 && res.status < 600);
    if (retryable && attempt < maxAttempts) {
      attempt += 1;
      const retryAfterHeader = res.headers.get("retry-after");
      const retryAfterSec = retryAfterHeader ? parseFloat(retryAfterHeader) : 0;
      // Cap Retry-After at 2s — Jikan sometimes asks for 60s which would
      // freeze the page. Falling back to stale cache is a better UX.
      const wait =
        retryAfterSec > 0
          ? Math.min(2000, retryAfterSec * 1000) + 100
          : Math.min(1500, 500 * 2 ** (attempt - 1)) + Math.random() * 200;
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    // Friendly error messages — these can bubble up to the UI verbatim.
    let friendly;
    if (res.status === 429) {
      friendly = "Live data is rate-limited. Showing cached results when possible.";
    } else if (res.status >= 500) {
      friendly = "Live data temporarily unavailable. Try again in a moment.";
    } else if (res.status === 404) {
      friendly = "That entry could not be found.";
    } else {
      friendly = `Could not load live data (status ${res.status}).`;
    }
    const err = new Error(friendly);
    err.status = res.status;
    throw err;
  }
}

async function jget(path) {
  // 1. Memory hit (fresh)?
  const mem = memoryCache.get(path);
  if (mem && Date.now() - mem.t < TTL_MS) return mem.v;

  // 2. SessionStorage hit (fresh)? Promote to memory so we don't re-parse JSON.
  const stored = readStorage(path);
  if (stored) {
    memoryCache.set(path, stored);
    return stored.v;
  }

  // 3. In-flight dedupe — multiple components requesting the same path
  //    during a single render pass share one fetch.
  const pending = inflight.get(path);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const json = await schedule(() => fetchWithRetry(path));
      const entry = { t: Date.now(), v: json };
      memoryCache.set(path, entry);
      writeStorage(path, entry);
      return json;
    } catch (err) {
      // Stale-while-error: when the API is rate-limiting us or down, return
      // whatever cached data we have (ignoring TTL) instead of failing the UI.
      const staleMem = memoryCache.get(path);
      if (staleMem) return staleMem.v;
      const staleStorage = readStorageRaw(path);
      if (staleStorage) {
        memoryCache.set(path, staleStorage);
        return staleStorage.v;
      }
      throw err;
    }
  })().finally(() => {
    inflight.delete(path);
  });

  inflight.set(path, promise);
  return promise;
}

export async function searchAnime(query, limit = 1) {
  if (!query) return [];
  const q = encodeURIComponent(query);
  const data = await jget(`/anime?q=${q}&limit=${limit}&order_by=popularity&sort=asc`);
  return data?.data ?? [];
}

export async function searchAnimeFull({
  query,
  page = 1,
  limit = 24,
  orderBy = "popularity",
  sort = "asc",
}) {
  if (!query) return { data: [], pagination: null };
  const q = encodeURIComponent(query);
  const json = await jget(
    `/anime?q=${q}&limit=${limit}&page=${page}&order_by=${orderBy}&sort=${sort}`
  );
  return { data: json?.data ?? [], pagination: json?.pagination ?? null };
}

export async function getAnimeById(malId) {
  if (!malId) return null;
  const data = await jget(`/anime/${malId}/full`);
  return data?.data ?? null;
}

export async function getEpisodes(malId, page = 1) {
  if (!malId) return [];
  const data = await jget(`/anime/${malId}/episodes?page=${page}`);
  return data?.data ?? [];
}

export async function getEpisode(malId, epNum) {
  if (!malId || !epNum) return null;
  const data = await jget(`/anime/${malId}/episodes/${epNum}`);
  return data?.data ?? null;
}

export async function getCharacters(malId) {
  if (!malId) return [];
  const data = await jget(`/anime/${malId}/characters`);
  return data?.data ?? [];
}

export async function getPictures(malId) {
  if (!malId) return [];
  const data = await jget(`/anime/${malId}/pictures`);
  return data?.data ?? [];
}

export async function getTopAnime(limit = 25, page = 1, type = "") {
  const typeParam = type ? `&type=${type}` : "";
  const data = await jget(`/top/anime?limit=${limit}&page=${page}${typeParam}`);
  return {
    items: data?.data ?? [],
    pagination: data?.pagination ?? {
      last_visible_page: 1,
      has_next_page: false,
      current_page: 1,
      items: { count: 0, total: 0, per_page: limit },
    },
  };
}

export async function getRecommendations(malId) {
  if (!malId) return [];
  const data = await jget(`/anime/${malId}/recommendations`);
  return data?.data ?? [];
}

export async function getTopCharacters(page = 1) {
  const data = await jget(`/top/characters?page=${page}`);
  return data?.data ?? [];
}

export async function getCharacterFull(id) {
  if (!id) return null;
  const data = await jget(`/characters/${id}/full`);
  return data?.data ?? null;
}

export async function searchCharacters(query, limit = 20) {
  if (!query) return [];
  const data = await jget(
    `/characters?q=${encodeURIComponent(query)}&limit=${limit}&order_by=favorites&sort=desc`
  );
  return data?.data ?? [];
}

export async function getTopPeople(page = 1) {
  const data = await jget(`/top/people?page=${page}`);
  return data?.data ?? [];
}

export async function getPersonFull(id) {
  if (!id) return null;
  const data = await jget(`/people/${id}/full`);
  return data?.data ?? null;
}

export async function searchPeople(query, limit = 20) {
  if (!query) return [];
  const data = await jget(
    `/people?q=${encodeURIComponent(query)}&limit=${limit}&order_by=favorites&sort=desc`
  );
  return data?.data ?? [];
}

export async function getGenres(filter = "genres") {
  const data = await jget(`/genres/anime?filter=${filter}`);
  return data?.data ?? [];
}

export async function getAnimeVideos(malId) {
  if (!malId) return null;
  const data = await jget(`/anime/${malId}/videos`);
  return data?.data ?? null;
}

export async function getAnimePictures(malId) {
  if (!malId) return [];
  const data = await jget(`/anime/${malId}/pictures`);
  return data?.data ?? [];
}

export async function getAnimeByGenre({
  genreId,
  page = 1,
  limit = 24,
  type = null,
  orderBy = "score",
  sort = "desc",
}) {
  if (!genreId) return { data: [], pagination: null };
  const params = new URLSearchParams({
    genres: String(genreId),
    page: String(page),
    limit: String(limit),
    order_by: orderBy,
    sort,
  });
  if (type) params.set("type", type);
  const json = await jget(`/anime?${params.toString()}`);
  return { data: json?.data ?? [], pagination: json?.pagination ?? null };
}

/**
 * Builds a minimum-viable anime object from an editorial JSON entry so the UI
 * can render immediately even if Jikan is completely unreachable. Returned
 * shape mirrors the Jikan response just enough for FeaturedCard / AnimeCard
 * to display title + blurb + rank without a network call.
 */
function editorialFallback(entry) {
  if (!entry || typeof entry !== "object") return null;
  return {
    mal_id: entry.mal_id ?? `editorial-${entry.title}`,
    title: entry.title,
    title_english: entry.title,
    images: { webp: {}, jpg: {} },
    score: null,
    episodes: null,
    year: null,
    genres: [],
    _editorial: entry,
    _placeholder: true,
  };
}

export async function resolveFromTitles(entries) {
  // The global limiter already enforces per-second + per-minute caps, so we
  // can fire these in parallel and let the queue pace them. Prefer the direct
  // /anime/{id}/full endpoint when the editorial JSON has a baked-in mal_id —
  // skips the search step entirely, halving the requests we need and yielding
  // exact matches instead of "popular hit for this query".
  const lookups = entries.map(async (entry) => {
    const isObj = entry && typeof entry === "object";
    const query = isObj ? entry.search ?? entry.title : entry;
    const malId = isObj ? entry.mal_id : null;
    try {
      if (malId) {
        const hit = await getAnimeById(malId);
        if (hit) return { ...hit, _editorial: isObj ? entry : undefined };
      }
      const hits = await searchAnime(query, 1);
      if (hits[0]) {
        return isObj ? { ...hits[0], _editorial: entry } : hits[0];
      }
    } catch (e) {
      console.warn(`Jikan lookup failed for "${query}":`, e);
    }
    // Never drop the entry — synthesize a placeholder so the editorial card
    // (title / blurb / vibe) still renders even when the API is down.
    return isObj ? editorialFallback(entry) : null;
  });
  const results = await Promise.all(lookups);
  return results.filter(Boolean);
}
