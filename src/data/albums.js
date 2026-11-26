import afterhours from "../assets/img/albums/afterhours.jpeg";
import bbtm from "../assets/img/albums/bbtm.jpeg";
import dawnfm from "../assets/img/albums/dawnfm.jpeg";
import eos from "../assets/img/albums/eos.jpeg";
import hob from "../assets/img/albums/hob.jpg";
import hut from "../assets/img/albums/hut.png";
import kissland from "../assets/img/albums/kissland.jpeg";
import mdm from "../assets/img/albums/mdm.jpeg";
import starboy from "../assets/img/albums/starboy.jpeg";
import thursday from "../assets/img/albums/thursday.jpg";
import videoIds from "./videoIds.json";

// `id` doubles as the route path, e.g. /hob, /kissland, /bbtm.
// Track lists are the standard editions (no bonus tracks).
export const albums = [
  {
    id: "hob",
    title: "House of Balloons",
    year: 2011,
    src: hob,
    color: "202020",
    tracks: [
      "High for This",
      "What You Need",
      "House of Balloons / Glass Table Girls",
      "The Morning",
      "Wicked Games",
      "The Party & The After Party",
      "Coming Down",
      "Loft Music",
      "The Knowing",
    ],
  },
  {
    id: "thursday",
    title: "Thursday",
    year: 2011,
    src: thursday,
    color: "202020",
    tracks: [
      "Lonely Star",
      "Life of the Party",
      "Thursday",
      "The Zone",
      "The Birds, Pt. 1",
      "The Birds, Pt. 2",
      "Gone",
      "Rolling Stone",
      "Heaven or Las Vegas",
    ],
  },
  {
    id: "eos",
    title: "Echoes of Silence",
    year: 2011,
    src: eos,
    color: "202020",
    tracks: [
      "D.D.",
      "Montreal",
      "Outside",
      "XO / The Host",
      "Initiation",
      "Same Old Song",
      "The Fall",
      "Next",
      "Echoes of Silence",
    ],
  },
  {
    id: "kissland",
    title: "Kiss Land",
    year: 2013,
    src: kissland,
    color: "0c5f3d",
    tracks: [
      "Professional",
      "The Town",
      "Adaptation",
      "Love in the Sky",
      "Belong to the World",
      "Live For",
      "Wanderlust",
      "Kiss Land",
      "Pretty",
      "Tears in the Rain",
    ],
  },
  {
    id: "bbtm",
    title: "Beauty Behind the Madness",
    year: 2015,
    src: bbtm,
    color: "8b8b8c",
    tracks: [
      "Real Life",
      "Losers",
      "Tell Your Friends",
      "Often",
      "The Hills",
      "Acquainted",
      "Can't Feel My Face",
      "Shameless",
      "Earned It",
      "In the Night",
      "As You Are",
      "Dark Times",
      "Prisoner",
      "Angel",
    ],
  },
  {
    id: "mdm",
    title: "My Dear Melancholy,",
    year: 2018,
    src: mdm,
    color: "903413",
    tracks: [
      "Call Out My Name",
      "Try Me",
      "Wasted Times",
      "I Was Never There",
      "Hurt You",
      "Privilege",
    ],
  },
  {
    id: "starboy",
    title: "Starboy",
    year: 2016,
    src: starboy,
    color: "c40b35",
    tracks: [
      "Starboy",
      "Party Monster",
      "False Alarm",
      "Reminder",
      "Rockin'",
      "Secrets",
      "True Colors",
      "Stargirl Interlude",
      "Sidewalks",
      "Six Feet Under",
      "Love to Lay",
      "A Lonely Night",
      "Attention",
      "Ordinary Life",
      "Nothing Without You",
      "All I Know",
      "Die for You",
      "I Feel It Coming",
    ],
  },
  {
    id: "afterhours",
    title: "After Hours",
    year: 2020,
    src: afterhours,
    color: "7b261b",
    tracks: [
      "Alone Again",
      "Too Late",
      "Hardest to Love",
      "Scared to Live",
      "Snowchild",
      "Escape from LA",
      "Heartless",
      "Faith",
      "Blinding Lights",
      "In Your Eyes",
      "Save Your Tears",
      "Repeat After Me (Interlude)",
      "After Hours",
      "Until I Bleed Out",
    ],
  },
  {
    id: "dawnfm",
    title: "Dawn FM",
    year: 2022,
    src: dawnfm,
    color: "1a3b49",
    tracks: [
      "Dawn FM",
      "Gasoline",
      "How Do I Make You Love Me?",
      "Take My Breath",
      "Sacrifice",
      "A Tale by Quincy",
      "Out of Time",
      "Here We Go... Again",
      "Best Friends",
      "Is There Someone Else?",
      "Starry Eyes",
      "Every Angel Is Terrifying",
      "Don't Break My Heart",
      "I Heard You're Married",
      "Less than Zero",
      "Phantom Regret by Jim",
    ],
  },
  {
    id: "hut",
    title: "Hurry Up Tomorrow",
    year: 2025,
    src: hut,
    color: "3b2a1e",
    tracks: [
      "Wake Me Up",
      "Cry for Me",
      "I Can't Fucking Sing",
      "São Paulo",
      "Until We're Skin & Bones",
      "Baptized in Fear",
      "Open Hearts",
      "Opening Night",
      "Reflections Laughing",
      "Enjoy the Show",
      "Given Up on Me",
      "I Can't Wait to Get There",
      "Timeless",
      "Niagara Falls",
      "Take Me Back to LA",
      "Big Sleep",
      "Give Me Mercy",
      "Drive",
      "The Abyss",
      "Red Terror",
      "Without a Warning",
      "Hurry Up Tomorrow",
    ],
  },
];

// Typography per album, using free Google Fonts lookalikes (loaded in
// index.html) of each cover's lettering. Covers without lettering (BBTM,
// After Hours, Dawn FM) get a font that suits the era instead.
//   display: title font, body: everything else, accent: title colour,
//   title: optional text to show instead of `title` (e.g. cover spelling).
const trilogy = {
  display: "'Inter Tight', sans-serif",
  body: "'Inter Tight', sans-serif",
  weight: 800,
  tracking: "-0.05em",
  transform: "none",
};

const themes = {
  hob: { ...trilogy, title: "HouseOfBalloons" },
  thursday: { ...trilogy },
  eos: { ...trilogy, title: "EchoesOfSilence" },
  kissland: {
    // Naive Deco Sans Double is loaded from src/assets (see album.css).
    display: "'Naive Deco Sans Double', 'Monoton', sans-serif",
    body: "'Inter Tight', sans-serif",
    weight: 400,
    tracking: "0.04em",
    transform: "uppercase",
    accent: "#3dffa8",
    glow: "0 0 18px rgba(61, 255, 168, 0.55)",
  },
  bbtm: {
    display: "'Cormorant Garamond', serif",
    body: "'Cormorant Garamond', serif",
    weight: 600,
    tracking: "0.02em",
    transform: "none",
    bodySize: "1.2rem",
  },
  mdm: {
    display: "'IM Fell English SC', serif",
    body: "'IM Fell English', serif",
    weight: 400,
    tracking: "0.02em",
    transform: "uppercase",
    accent: "#ff7a3d",
    bodySize: "1.15rem",
  },
  starboy: {
    display: "'League Spartan', sans-serif",
    body: "'League Spartan', sans-serif",
    weight: 900,
    tracking: "-0.01em",
    transform: "uppercase",
    accent: "#f5c518",
  },
  afterhours: {
    display: "'Bodoni Moda', serif",
    body: "'Bodoni Moda', serif",
    weight: 700,
    tracking: "0",
    transform: "none",
    italic: true,
  },
  dawnfm: {
    display: "'Michroma', sans-serif",
    body: "'Inter Tight', sans-serif",
    weight: 400,
    tracking: "0.08em",
    transform: "uppercase",
  },
  hut: {
    display: "'Anton', sans-serif",
    body: "'Archivo Narrow', sans-serif",
    weight: 400,
    tracking: "0",
    transform: "uppercase",
    bodySize: "1.1rem",
  },
};

for (const album of albums) {
  album.theme = themes[album.id];
}

// videoIds.json is written by `npm run fetch-videos` (scripts/fetch-video-ids.mjs):
// { [albumId]: { [trackTitle]: { id, title, channel } } }.
// To swap a wrong match, edit its "id" there by hand.
for (const album of albums) {
  const found = videoIds[album.id] ?? {};
  album.videoIds = album.tracks.map((track) => found[track]?.id ?? null);
}

export const getAlbum = (id) => albums.find((album) => album.id === id);

// CSS custom properties for an album's typography (see album.css).
export const themeVars = (album) => {
  const t = album.theme;
  return {
    "--album-display": t.display,
    "--album-body": t.body,
    "--album-weight": t.weight,
    "--album-tracking": t.tracking,
    "--album-transform": t.transform,
    "--album-style": t.italic ? "italic" : "normal",
    "--album-accent": t.accent ?? "#fff",
    "--album-glow": t.glow ?? "none",
    "--album-body-size": t.bodySize ?? "1.05rem",
  };
};
