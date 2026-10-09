// Turns a normal Spotify share link (track, album, playlist, artist, ...) into
// its embed URL. Returns null if the link isn't one we recognize.
export function spotifyEmbedUrl(url?: string) {
  const match = url?.match(
    /open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/
  );
  return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : null;
}
