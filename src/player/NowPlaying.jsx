import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Link } from "react-router";
import { themeVars } from "../data/albums.js";
import { usePlayer } from "./PlayerContext.js";

const LABELS = {
  loading: "Loading",
  playing: "Now playing",
  paused: "Paused",
  ended: "Finished",
  error: "Can't play",
};

function NowPlaying() {
  const {
    album,
    track,
    status,
    error,
    isPlaying,
    togglePlay,
    next,
    previous,
    hasVideo,
    videoOpen,
    toggleVideo,
    lyricsOpen,
    toggleLyrics,
    closeLyrics,
  } = usePlayer();

  if (!album) return null;

  return (
    <div
      className="now-playing"
      role="region"
      aria-label="Now playing"
      style={themeVars(album)}
    >
      <Link
        to={`/${album.id}`}
        className="now-playing-link"
        onClick={closeLyrics}
      >
        <img src={album.src} alt="" />
        <span className="now-playing-text">
          <span className="now-playing-label">{LABELS[status] ?? ""}</span>
          <span className="now-playing-title">{track}</span>
          <span
            className={
              "now-playing-album" +
              (status === "error" ? " now-playing-error" : "")
            }
          >
            {status === "error" ? error : album.title}
          </span>
        </span>
      </Link>
      <div className="now-playing-controls">
        <button
          type="button"
          className={"lyrics-toggle" + (lyricsOpen ? " active" : "")}
          onClick={toggleLyrics}
          aria-pressed={lyricsOpen}
          aria-label="Lyrics"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M4 6h16M4 12h11M4 18h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="lyrics-toggle-label">Lyrics</span>
        </button>
        {hasVideo && (
          <button
            type="button"
            className="video-toggle"
            onClick={toggleVideo}
            aria-label={videoOpen ? "Hide video" : "Show video"}
            aria-pressed={videoOpen}
          >
            {videoOpen ? "▾" : "▴"}
          </button>
        )}
        <button
          type="button"
          className="prev"
          onClick={previous}
          aria-label="Previous track"
        >
          <SkipBack size={18} fill="currentColor" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="play"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" aria-hidden="true" />
          ) : (
            <Play size={18} fill="currentColor" aria-hidden="true" />
          )}
        </button>
        <button type="button" onClick={next} aria-label="Next track">
          <SkipForward size={18} fill="currentColor" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default NowPlaying;
