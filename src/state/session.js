// In-memory state that must survive route changes (Hero unmounts while an
// album page is open). Resets on full page reload.
export const session = {
  // The black XO loader only plays on the first visit to the hero.
  introPlayed: false,
  // Album the hero slider should land on when the user comes back.
  lastAlbumId: null,
};
