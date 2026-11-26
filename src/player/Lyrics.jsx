import { useEffect, useRef, useState } from "react";
import { themeVars } from "../data/albums.js";
import { usePlayer } from "./PlayerContext.js";
import { fetchLyrics, lyricsKey } from "./lyrics.js";

// Show the next line a touch early so it lands with the vocal.
const LEAD = 0.25;
// After the user scrolls, stop following the song for a moment.
const HOLD_MS = 3500;

function Lyrics() {
  const { album, current, track, lyricsOpen } = usePlayer();
  if (!album || !lyricsOpen) return null;
  // Keyed per song so all state (lyrics, scroll) resets on track change.
  return (
    <LyricsPanel
      key={lyricsKey(album, current.index)}
      album={album}
      index={current.index}
      track={track}
    />
  );
}

function LyricsPanel({ album, index, track }) {
  const { getTime, getDuration, seekTo, closeLyrics } = usePlayer();
  const [lyrics, setLyrics] = useState(null); // null while loading
  const [attempt, setAttempt] = useState(0);
  const [time, setTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const bodyRef = useRef(null);
  const holdUntil = useRef(0);

  useEffect(() => {
    let cancelled = false;
    fetchLyrics(album, index).then(
      (data) => !cancelled && setLyrics(data),
      (err) => !cancelled && setLyrics({ kind: "error", message: err.message }),
    );
    return () => {
      cancelled = true;
    };
  }, [album, index, attempt]);

  // Follow the YouTube player's clock.
  const synced = lyrics?.kind === "synced";
  useEffect(() => {
    if (!synced) return;
    const id = setInterval(() => {
      setTime(getTime());
      setVideoDuration(getDuration());
    }, 200);
    return () => clearInterval(id);
  }, [synced, getTime, getDuration]);

  let active = -1;
  if (synced) {
    for (let i = 0; i < lyrics.lines.length; i++) {
      if (lyrics.lines[i].time <= time + LEAD) active = i;
      else break;
    }
  }

  // Keep the current line a little above centre (clear of the video card on
  // phones), unless the user is scrolling around.
  useEffect(() => {
    const body = bodyRef.current;
    if (active < 0 || !body || Date.now() < holdUntil.current) return;
    const line = body.querySelector(`[data-line="${active}"]`);
    if (!line) return;
    body.scrollTo({
      top: line.offsetTop - body.clientHeight * 0.38 + line.offsetHeight / 2,
      behavior: "smooth",
    });
  }, [active]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeLyrics();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLyrics]);

  const hold = () => {
    holdUntil.current = Date.now() + HOLD_MS;
  };

  const jumpTo = (seconds) => {
    holdUntil.current = 0;
    seekTo(seconds);
  };

  const retry = () => {
    setLyrics(null);
    setAttempt((n) => n + 1);
  };

  // Music videos often have intros, so their timing won't match the album.
  const offSync =
    synced &&
    videoDuration > 0 &&
    Math.abs(videoDuration - lyrics.duration) > 5;

  let content;
  if (!lyrics) {
    content = <p className="lyrics-message">Loading lyrics…</p>;
  } else if (lyrics.kind === "error") {
    content = (
      <p className="lyrics-message">
        {lyrics.message}.{" "}
        <button type="button" className="lyrics-retry" onClick={retry}>
          Try again
        </button>
      </p>
    );
  } else if (lyrics.kind === "missing") {
    content = <p className="lyrics-message">No lyrics found for this song.</p>;
  } else if (lyrics.kind === "instrumental") {
    content = <p className="lyrics-message">Instrumental ♪</p>;
  } else if (lyrics.kind === "plain") {
    content = (
      <>
        <p className="lyrics-note">These lyrics aren't synced to the song.</p>
        <div className="lyrics-plain">
          {lyrics.lines.map((line, i) => (
            <p key={i}>{line || " "}</p>
          ))}
        </div>
      </>
    );
  } else {
    content = (
      <>
        {offSync && (
          <p className="lyrics-note">
            This video isn't the album version, so the timing may be off.
          </p>
        )}
        <ol className="lyrics-lines">
          {lyrics.lines.map((line, i) => (
            <li key={i}>
              <button
                type="button"
                data-line={i}
                className={
                  "lyrics-line" +
                  (i === active ? " active" : i < active ? " past" : "")
                }
                aria-current={i === active ? "true" : undefined}
                onClick={() => jumpTo(line.time)}
              >
                {line.text || "♪"}
              </button>
            </li>
          ))}
        </ol>
      </>
    );
  }

  return (
    <section
      className="lyrics"
      aria-label={`Lyrics: ${track}`}
      style={{ "--lyrics-bg": "#" + album.color, ...themeVars(album) }}
    >
      <header className="lyrics-header">
        <img src={album.src} alt="" />
        <div className="lyrics-heading">
          <span className="lyrics-track">{track}</span>
          <span className="lyrics-album">{album.title}</span>
        </div>
        <button
          type="button"
          className="lyrics-close"
          onClick={closeLyrics}
          aria-label="Close lyrics"
        >
          ✕
        </button>
      </header>
      <div
        ref={bodyRef}
        className={"lyrics-body" + (synced ? " synced" : "")}
        onWheel={hold}
        onTouchMove={hold}
      >
        {content}
        <p className="lyrics-credit">Lyrics from LRCLIB</p>
      </div>
    </section>
  );
}

export default Lyrics;
