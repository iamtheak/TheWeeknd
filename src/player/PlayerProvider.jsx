import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { albums, getAlbum } from "../data/albums.js";
import { PlayerContext } from "./PlayerContext.js";
import "./player.css";

// YouTube IFrame Player API: load the script once, resolve with window.YT.
let apiPromise = null;
function loadYouTubeApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => {
      apiPromise = null;
      reject(new Error("Could not load the YouTube player"));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

// Video IDs are looked up ahead of time by `npm run fetch-videos` and stored
// in src/data/videoIds.json, so the site itself needs no API key.
async function findVideoId(album, index) {
  const videoId = album.videoIds[index];
  if (!videoId) throw new Error("No video for this song yet");
  return videoId;
}

// The album after this one, wrapping from the last back to the first.
function nextAlbumOf(albumId) {
  const i = albums.findIndex((album) => album.id === albumId);
  return albums[(i + 1) % albums.length];
}

export function PlayerProvider({ children }) {
  // The open album page registers here to animate into the next album when
  // playback rolls over (see AlbumView).
  const albumChangeRef = useRef(null);
  const onAlbumChange = useCallback((handler) => {
    albumChangeRef.current = handler;
    return () => {
      if (albumChangeRef.current === handler) albumChangeRef.current = null;
    };
  }, []);
  // current: { albumId, index } of the loaded track, or null.
  const [current, setCurrent] = useState(null);
  // idle | loading | playing | paused | ended | error
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  // The video card only appears once YouTube has a video to show.
  const [hasVideo, setHasVideo] = useState(false);
  // Mobile only: the video card can be tucked away so it doesn't cover the page.
  const [videoOpen, setVideoOpen] = useState(true);
  const toggleVideo = useCallback(() => setVideoOpen((open) => !open), []);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const toggleLyrics = useCallback(() => setLyricsOpen((open) => !open), []);
  const closeLyrics = useCallback(() => setLyricsOpen(false), []);

  const hostRef = useRef(null);
  const playerPromiseRef = useRef(null);
  // The ready player, for synchronous reads (current time for lyrics).
  const playerRef = useRef(null);
  const requestRef = useRef(0);
  const currentRef = useRef(null);
  const handlersRef = useRef({});

  const ensurePlayer = useCallback(async () => {
    if (playerPromiseRef.current) return playerPromiseRef.current;
    const YT = await loadYouTubeApi();
    playerPromiseRef.current = new Promise((resolve) => {
      // YT.Player replaces its element, so give it a node React doesn't own.
      const el = document.createElement("div");
      hostRef.current.appendChild(el);
      const player = new YT.Player(el, {
        width: "100%",
        height: "100%",
        playerVars: { playsinline: 1, rel: 0 },
        events: {
          onReady: () => {
            playerRef.current = player;
            resolve(player);
          },
          onStateChange: (e) => handlersRef.current.onStateChange?.(e),
          onError: (e) => handlersRef.current.onError?.(e),
        },
      });
    });
    return playerPromiseRef.current;
  }, []);

  const playTrack = useCallback(
    async (albumId, index) => {
      const album = getAlbum(albumId);
      if (!album || index < 0 || index >= album.tracks.length) return;

      const request = ++requestRef.current;
      currentRef.current = { albumId, index };
      setCurrent(currentRef.current);
      setStatus("loading");
      setError(null);

      try {
        const [player, videoId] = await Promise.all([
          ensurePlayer(),
          findVideoId(album, index),
        ]);
        // A newer click won the race; drop this one.
        if (request !== requestRef.current) return;
        player.loadVideoById(videoId);
        setHasVideo(true);
      } catch (err) {
        if (request !== requestRef.current) return;
        setStatus("error");
        setError(err.message);
      }
    },
    [ensurePlayer],
  );

  const next = useCallback(() => {
    const cur = currentRef.current;
    if (!cur) return;
    const album = getAlbum(cur.albumId);
    if (cur.index + 1 < album.tracks.length) {
      playTrack(cur.albumId, cur.index + 1);
      return;
    }
    // Last song of the album: carry on into the next album, and let the
    // open album page (if any) follow along.
    const upcoming = nextAlbumOf(cur.albumId);
    playTrack(upcoming.id, 0);
    albumChangeRef.current?.(cur.albumId, upcoming);
  }, [playTrack]);

  const previous = useCallback(async () => {
    const cur = currentRef.current;
    if (!cur) return;
    const player = playerPromiseRef.current && (await playerPromiseRef.current);
    // Like most players: restart the song unless we're near its start.
    if (player && (cur.index === 0 || player.getCurrentTime() > 3)) {
      player.seekTo(0, true);
      return;
    }
    playTrack(cur.albumId, cur.index - 1);
  }, [playTrack]);

  const togglePlay = useCallback(async () => {
    const cur = currentRef.current;
    if (!cur) return;
    if (status === "error") {
      playTrack(cur.albumId, cur.index);
      return;
    }
    const player = await playerPromiseRef.current;
    if (!player) return;
    // Buffering counts as playing: pause stops it rather than doing nothing.
    if (status === "playing" || status === "loading") player.pauseVideo();
    else player.playVideo();
  }, [status, playTrack]);

  const getTime = useCallback(
    () => playerRef.current?.getCurrentTime?.() ?? 0,
    [],
  );
  const getDuration = useCallback(
    () => playerRef.current?.getDuration?.() ?? 0,
    [],
  );
  const seekTo = useCallback((seconds) => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(seconds, true);
    player.playVideo();
  }, []);

  useEffect(() => {
    handlersRef.current = {
      onStateChange: (e) => {
        const S = window.YT.PlayerState;
        if (e.data === S.PLAYING) setStatus("playing");
        else if (e.data === S.PAUSED) setStatus("paused");
        else if (e.data === S.BUFFERING) setStatus("loading");
        else if (e.data === S.ENDED) next();
      },
      onError: (e) => {
        // 101 / 150: the owner blocked embedding. Pick another video for this
        // track in src/data/videoIds.json.
        setStatus("error");
        setError(
          e.data === 101 || e.data === 150
            ? "This video can't be played outside YouTube"
            : `YouTube player error (${e.data})`,
        );
      },
    };
  }, [next]);

  const value = useMemo(() => {
    const album = current && getAlbum(current.albumId);
    return {
      current,
      album,
      track: album ? album.tracks[current.index] : null,
      status,
      error,
      // Buffering keeps the pause button, so it doesn't flicker mid-song.
      isPlaying: status === "playing" || status === "loading",
      playTrack,
      togglePlay,
      next,
      previous,
      hasVideo,
      videoOpen,
      toggleVideo,
      lyricsOpen,
      toggleLyrics,
      closeLyrics,
      getTime,
      getDuration,
      seekTo,
      onAlbumChange,
    };
  }, [
    current,
    status,
    error,
    playTrack,
    togglePlay,
    next,
    previous,
    hasVideo,
    videoOpen,
    toggleVideo,
    lyricsOpen,
    toggleLyrics,
    closeLyrics,
    getTime,
    getDuration,
    seekTo,
    onAlbumChange,
  ]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* YouTube's terms require the embedded player to stay visible
          (min 200x200), so it lives in a small card instead of being hidden. */}
      <div
        className={
          "yt-card" +
          (hasVideo ? " visible" : "") +
          (videoOpen ? "" : " collapsed")
        }
        aria-hidden={!hasVideo}
      >
        <div ref={hostRef} className="yt-host" />
      </div>
    </PlayerContext.Provider>
  );
}
