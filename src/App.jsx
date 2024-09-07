import { Route, Routes } from "react-router-dom";
import Hero from "./pages/hero/hero.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
    </Routes>
  );
};

export default App;
