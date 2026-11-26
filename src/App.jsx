import { Route, Routes } from "react-router";
import Album from "./pages/album/album.jsx";
import Hero from "./pages/hero/hero.jsx";
import Lyrics from "./player/Lyrics.jsx";
import NowPlaying from "./player/NowPlaying.jsx";
import { PlayerProvider } from "./player/PlayerProvider.jsx";

const App = () => {
  return (
    // The provider sits above <Routes> so music keeps playing across pages.
    <PlayerProvider>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/:albumId" element={<Album />} />
      </Routes>
      <Lyrics />
      <NowPlaying />
    </PlayerProvider>
  );
};

export default App;
