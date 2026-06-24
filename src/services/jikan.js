const JIKAN_BASE = "https://api.jikan.moe/v4";

const cache = new Map();
const TTL_MS = 1000 * 60 * 30;

async function jget(path) {
  const cached = cache.get(path);
  if (cached && Date.now() - cached.t < TTL_MS) return cached.v;

  const res = await fetch(`${JIKAN_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Jikan request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  cache.set(path, { t: Date.now(), v: json });
  return json;
}

export async function searchAnime(query, limit = 1) {
  if (!query) return [];
  const q = encodeURIComponent(query);
  const data = await jget(`/anime?q=${q}&limit=${limit}&order_by=popularity&sort=asc`);
  return data?.data ?? [];
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

export async function getTopAnime(limit = 25) {
  const data = await jget(`/top/anime?limit=${limit}`);
  return data?.data ?? [];
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
