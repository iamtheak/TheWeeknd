// Lyrics come from LRCLIB (https://lrclib.net): free, no API key, and most
// songs have time-synced (LRC) lyrics we can follow along with the video.
const API = "https://lrclib.net/api";
const ARTIST = "The Weeknd";

// One request per song per visit.
const cache = new Map();

export const lyricsKey = (album, index) => `${album.id}:${index}`;

export function fetchLyrics(album, index) {
  const key = lyricsKey(album, index);
  if (!cache.has(key)) {
    const request = load(album.title, album.tracks[index]).catch((err) => {
      cache.delete(key); // let a retry try again
      throw err;
    });
    cache.set(key, request);
  }
  return cache.get(key);
}

async function getJson(url) {
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("Couldn't reach the lyrics service");
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Lyrics service error (${res.status})`);
  return res.json();
}

async function load(albumTitle, track) {
  // Exact match first (artist + song + album).
  let record = await getJson(
    `${API}/get?${new URLSearchParams({
      artist_name: ARTIST,
      track_name: track,
      album_name: albumTitle,
    })}`,
  );

  // Album names often differ (Trilogy, deluxe editions), so fall back to a
  // search and prefer a result with synced lyrics.
  if (!record?.syncedLyrics) {
    const results =
      (await getJson(
        `${API}/search?${new URLSearchParams({
          artist_name: ARTIST,
          track_name: track,
        })}`,
      )) ?? [];
    const ours = results.filter((r) => /weeknd/i.test(r.artistName));
    const best =
      ours.find((r) => r.syncedLyrics) ??
      ours.find((r) => r.plainLyrics || r.instrumental);
    if (best && (!record || best.syncedLyrics)) record = best;
  }

  return toLyrics(record);
}

function toLyrics(record) {
  if (!record) return { kind: "missing" };
  if (record.instrumental) return { kind: "instrumental" };
  if (record.syncedLyrics) {
    return {
      kind: "synced",
      lines: parseLrc(record.syncedLyrics),
      duration: record.duration,
    };
  }
  if (record.plainLyrics) {
    return { kind: "plain", lines: record.plainLyrics.split("\n") };
  }
  return { kind: "missing" };
}

// "[01:02.34] text" -> { time: 62.34, text }. A line may carry several tags.
const TAG = /\[(\d+):(\d+(?:\.\d+)?)\]/g;

export function parseLrc(lrc) {
  const lines = [];
  for (const raw of lrc.split("\n")) {
    const tags = [...raw.matchAll(TAG)];
    if (!tags.length) continue;
    const text = raw.replace(TAG, "").trim();
    for (const [, min, sec] of tags) {
      lines.push({ time: Number(min) * 60 + Number(sec), text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}
