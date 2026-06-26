const JIKAN_BASE = "https://api.jikan.moe/v4";

// Two-tier cache:
//   1. In-memory Map  — instant, lasts for the SPA session
//   2. sessionStorage — survives reloads within the same tab, capped at ~5MB
const memoryCache = new Map();
const inflight = new Map();
const TTL_MS = 1000 * 60 * 30; // 30 minutes
const STORAGE_KEY = "jikan_cache_v1";

const hasStorage = (() => {
  try {
    if (typeof sessionStorage === "undefined") return false;
    sessionStorage.setItem(`${STORAGE_KEY}__probe`, "1");
    sessionStorage.removeItem(`${STORAGE_KEY}__probe`);
    return true;
  } catch {
    return false;
  }
})();

function readStorage(path) {
  if (!hasStorage) return null;
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY}:${path}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() - parsed.t > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(path, entry) {
  if (!hasStorage) return;
  try {
    sessionStorage.setItem(`${STORAGE_KEY}:${path}`, JSON.stringify(entry));
  } catch {
    // Quota exceeded — clear our cache namespace and try once more silently.
    try {
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith(`${STORAGE_KEY}:`)) sessionStorage.removeItem(key);
      }
      sessionStorage.setItem(`${STORAGE_KEY}:${path}`, JSON.stringify(entry));
    } catch {
      /* give up — memory cache still works */
    }
  }
}

async function jget(path) {
  // 1. Memory hit?
  const mem = memoryCache.get(path);
  if (mem && Date.now() - mem.t < TTL_MS) return mem.v;

  // 2. SessionStorage hit? Promote to memory so we don't re-parse JSON.
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
    let attempt = 0;
    while (true) {
      const res = await fetch(`${JIKAN_BASE}${path}`);
      if (res.ok) {
        const json = await res.json();
        const entry = { t: Date.now(), v: json };
        memoryCache.set(path, entry);
        writeStorage(path, entry);
        return json;
      }
      // Honor Jikan's 3 req/s + 60 req/min rate limit with a short backoff.
      if (res.status === 429 && attempt < 2) {
        attempt += 1;
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
        continue;
      }
      throw new Error(
        `Jikan request failed: ${res.status} ${res.statusText}`
      );
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

export async function resolveFromTitles(entries) {
  const results = [];
  for (const entry of entries) {
    const isObj = entry && typeof entry === "object";
    const query = isObj ? entry.search ?? entry.title : entry;
    try {
      const hits = await searchAnime(query, 1);
      if (hits[0]) {
        results.push(isObj ? { ...hits[0], _editorial: entry } : hits[0]);
      }
      await new Promise((r) => setTimeout(r, 350));
    } catch (e) {
      console.warn(`Jikan lookup failed for "${query}":`, e);
    }
  }
  return results;
}
