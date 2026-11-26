import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { getAlbum, themeVars } from "../../data/albums.js";
import { usePlayer } from "../../player/PlayerContext.js";
import { session } from "../../state/session.js";
import "./album.css";

gsap.registerPlugin(useGSAP);

// Size of the cover as rendered on the hero slider (see hero.css): an
// object-fit: contain image inside a box whose size depends on the viewport.
function heroCoverSize() {
  const vw = window.innerWidth / 100;
  const vh = window.innerHeight / 100;
  const mq = (w) => window.matchMedia(`(max-width: ${w}px)`).matches;
  if (mq(768)) return Math.min(70 * vw, 50 * vh);
  if (mq(1024)) return Math.min(60 * vw, 70 * vh);
  if (mq(1440)) return Math.min(50 * vw, 80 * vh);
  return Math.min(50 * vw, 100 * vh);
}

function Album() {
  const { albumId } = useParams();
  const album = getAlbum(albumId);

  if (!album) return <Navigate to="/" replace />;
  // key: replay the intro animation when moving between albums.
  return <AlbumView key={album.id} album={album} />;
}

function AlbumView({ album }) {
  const navigate = useNavigate();
  const { current, status, playTrack, togglePlay, onAlbumChange } =
    usePlayer();

  const rootRef = useRef(null);
  const coverRef = useRef(null);
  const tlRef = useRef(null);

  useEffect(() => {
    session.lastAlbumId = album.id;
    document.title = `${album.title} | XO`;
    return () => {
      document.title = "XO | Till We OD";
    };
  }, [album]);

  useGSAP(
    () => {
      window.scrollTo(0, 0);

      // The cover starts where it sat on the hero (centred, hero size)
      // and slides to its place on the right.
      const rect = coverRef.current.getBoundingClientRect();
      const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
      const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);
      const scale = heroCoverSize() / rect.width;

      tlRef.current = gsap
        .timeline()
        .from(coverRef.current, {
          x: dx,
          y: dy,
          scale,
          duration: 1.1,
          ease: "power3.inOut",
        })
        .from(
          ".album-header > *",
          {
            opacity: 0,
            x: -40,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
          },
          "-=0.45",
        )
        .from(
          ".track",
          {
            opacity: 0,
            x: -30,
            duration: 0.4,
            stagger: 0.03,
            ease: "power2.out",
          },
          "<0.15",
        );
    },
    { scope: rootRef },
  );

  const goBack = () => {
    const leave = () => {
      // Came from the hero: pop history so the browser back stack stays sane.
      if (window.history.state?.idx > 0) navigate(-1);
      else navigate("/", { replace: true });
    };
    const tl = tlRef.current;
    if (!tl) return leave();
    tl.eventCallback("onReverseComplete", leave);
    tl.timeScale(1.6).reverse();
  };

  // Playback rolled over from this album into the next one: bring the cover
  // back to the centre, slide across to the next cover (like the hero
  // slider), then open the next album's page, whose intro starts centred.
  const { contextSafe } = useGSAP({ scope: rootRef });
  const changingRef = useRef(false);
  useEffect(() => {
    const advance = contextSafe((nextAlbum) => {
      const tl = tlRef.current;
      if (changingRef.current || !tl) return;
      changingRef.current = true;
      new Image().src = nextAlbum.src;

      const slide = () => {
        const size = heroCoverSize();
        const incoming = document.createElement("img");
        incoming.src = nextAlbum.src;
        incoming.alt = "";
        incoming.className = "album-cover-incoming";
        incoming.style.width = `${size}px`;
        document.body.appendChild(incoming);

        const distance = window.innerWidth / 2 + size;
        gsap
          .timeline({
            defaults: { duration: 0.9, ease: "power3.inOut" },
            onComplete: () => {
              navigate(`/${nextAlbum.id}`, { replace: true });
              // Drop the stand-in once the new page has painted its cover.
              requestAnimationFrame(() =>
                requestAnimationFrame(() => incoming.remove()),
              );
            },
          })
          .to(coverRef.current, { x: `-=${distance}` })
          .fromTo(
            incoming,
            { xPercent: -50, yPercent: -50, x: distance },
            { x: 0 },
            "<",
          )
          // The page's CSS transition fades the colour across.
          .set(
            rootRef.current,
            { backgroundColor: "#" + nextAlbum.color },
            "<",
          );
      };

      tl.eventCallback("onReverseComplete", slide);
      tl.timeScale(1.6).reverse();
    });

    return onAlbumChange((fromId, nextAlbum) => {
      if (fromId === album.id) advance(nextAlbum);
    });
  }, [album.id, onAlbumChange, contextSafe, navigate]);

  const isCurrentAlbum = current?.albumId === album.id;

  return (
    <div
      ref={rootRef}
      className="album-page"
      style={{ backgroundColor: "#" + album.color, ...themeVars(album) }}
    >
      <section className="album-info">
        <div className="album-header">
          <button type="button" className="album-back" onClick={goBack}>
            ← Back
          </button>
          <p className="album-year">{album.year}</p>
          <h1 className="album-title" aria-label={album.title}>
            {album.theme.title ?? album.title}
          </h1>
          <p className="album-count">{album.tracks.length} songs</p>
        </div>

        <ol className="tracklist">
          {album.tracks.map((track, index) => {
            const active = isCurrentAlbum && current.index === index;
            const playing = active && status === "playing";
            return (
              <li key={track + index}>
                <button
                  type="button"
                  className={"track" + (active ? " active" : "")}
                  onClick={() =>
                    active ? togglePlay() : playTrack(album.id, index)
                  }
                  aria-label={`${playing ? "Pause" : "Play"} ${track}`}
                >
                  <span className="track-number">
                    {playing ? (
                      <span className="eq" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="track-title">{track}</span>
                  {active && status === "loading" && (
                    <span className="track-status">loading…</span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="album-cover-wrap">
        <img
          ref={coverRef}
          className="album-cover"
          src={album.src}
          alt={album.title}
        />
      </div>
    </div>
  );
}

export default Album;
