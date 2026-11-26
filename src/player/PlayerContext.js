import { createContext, useContext } from "react";

export const PlayerContext = createContext(null);

export const usePlayer = () => {
  const player = useContext(PlayerContext);
  if (!player)
    throw new Error("usePlayer must be used inside <PlayerProvider>");
  return player;
};
