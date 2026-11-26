// One-time lookup of a YouTube video for every track in src/data/albums.js.
//
//   npm run fetch-videos
//
// Reads YOUTUBE_API_KEY from .env (never shipped to the browser) and writes
// src/data/videoIds.json. Each search costs 100 of the free 10,000 daily quota
// units, so ~100 tracks per day: progress is saved after every track and a
// re-run only searches tracks that are still missing. To redo one track,
// delete its entry from videoIds.json and run again.

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const outFile = fileURLToPath(new URL("src/data/videoIds.json", root));
const albumsFile = fileURLToPath(new URL("src/data/albums.js", root));

const envFile = fileURLToPath(new URL(".env", root));
if (existsSync(envFile)) process.loadEnvFile(envFile);

const apiKey = process.env.YOUTUBE_API_KEY ?? process.env.VITE_YOUTUBE_API_KEY;
if (!apiKey) {
  console.error("Set YOUTUBE_API_KEY in .env first.");
  process.exit(1);
}
if (!process.env.YOUTUBE_API_KEY) {
  console.warn(
    "Warning: rename VITE_YOUTUBE_API_KEY to YOUTUBE_API_KEY in .env.\n" +
      "Variables starting with VITE_ can be bundled into the website.\n",
  );
}

// albums.js imports images, which Node can't load, so read the data
// out of the source instead of importing it.
async function loadAlbums() {
  const src = await readFile(albumsFile, "utf8");
  const albums = [];
  const blockRe =
    /id:\s*"([^"]+)",\s*title:\s*"([^"]+)"[\s\S]*?tracks:\s*\[([\s\S]*?)\]/g;
  for (const [, id, title, list] of src.matchAll(blockRe)) {
    const tracks = [...list.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) =>
      JSON.parse(`"${m[1]}"`),
    );
    albums.push({ id, title, tracks });
  }
  return albums;
}

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const BAD =
  /\b(live|remix|sped up|slowed|reverb|lyrics?|cover|reaction|karaoke|instrumental|8d|nightcore|edit|mashup|tiktok|loop|a ?cappella|acapella|acoustic|demo)\b/;

// Prefer the auto-generated "The Weeknd - Topic" audio uploads.
function score(item, track) {
  const title = normalize(decode(item.snippet.title));
  const channel = item.snippet.channelTitle;
  const wanted = normalize(track.replace(/\(.*?\)/g, ""));
  let s = 0;
  if (channel === "The Weeknd - Topic") s += 5;
  else if (/^(the ?weeknd|theweekndvevo)$/i.test(channel.replace(/\s/g, "")))
    s += 3;
  if (title.includes(wanted)) s += 3;
  if (/\baudio\b/.test(title)) s += 1;
  if (BAD.test(title) && !BAD.test(normalize(track))) s -= 4;
  return s;
}

async function search(album, track) {
  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    videoEmbeddable: "true",
    maxResults: "10",
    q: `The Weeknd ${track} ${album.title} audio`,
  });
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
    {
      // Header rather than ?key= so the key stays out of URLs and logs.
      headers: { "X-Goog-Api-Key": apiKey },
    },
  );
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const reason = body?.error?.errors?.[0]?.reason;
    const err = new Error(body?.error?.message ?? `HTTP ${res.status}`);
    err.quota =
      reason === "quotaExceeded" ||
      reason === "dailyLimitExceeded" ||
      /quota/i.test(body?.error?.message ?? "");
    throw err;
  }
  const items = body.items ?? [];
  if (items.length === 0) return null;
  const best = items
    .map((item) => ({ item, s: score(item, track) }))
    .sort((a, b) => b.s - a.s)[0];
  return {
    id: best.item.id.videoId,
    title: decode(best.item.snippet.title),
    channel: best.item.snippet.channelTitle,
    ...(best.s < 6 ? { check: true } : {}),
  };
}

const albums = await loadAlbums();
const total = albums.reduce((n, a) => n + a.tracks.length, 0);
if (albums.length === 0) {
  console.error("Could not read albums from src/data/albums.js");
  process.exit(1);
}

const data = existsSync(outFile)
  ? JSON.parse(await readFile(outFile, "utf8"))
  : {};
const save = () => writeFile(outFile, JSON.stringify(data, null, 2) + "\n");

let done = 0;
let fetched = 0;
outer: for (const album of albums) {
  data[album.id] ??= {};
  for (const track of album.tracks) {
    if (data[album.id][track]) {
      done++;
      continue;
    }
    try {
      const found = await search(album, track);
      if (found) {
        data[album.id][track] = found;
        done++;
        fetched++;
        await save();
        const flag = found.check ? "  <- check" : "";
        console.log(
          `${album.id} / ${track}: ${found.title} [${found.channel}]${flag}`,
        );
      } else {
        console.log(`${album.id} / ${track}: no results`);
      }
    } catch (err) {
      if (err.quota) {
        console.log("\nDaily quota used up. Run again tomorrow to continue.");
        break outer;
      }
      console.error(`${album.id} / ${track}: ${err.message}`);
      break outer;
    }
  }
}

await save();
const flagged = Object.values(data)
  .flatMap((a) => Object.values(a))
  .filter((v) => v.check).length;
console.log(`\n${done}/${total} tracks have a video (${fetched} new).`);
if (flagged)
  console.log(
    `${flagged} matches marked "check": true; review them in videoIds.json.`,
  );
