"use client";

import { useState } from "react";

// Shows the video's thumbnail and only loads YouTube's (heavy) player once it's
// clicked, so a page full of videos stays fast.
export function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="embed"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button type="button" className="embed yt-facade" onClick={() => setPlaying(true)} aria-label={`Play ${title}`}>
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
      <svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true">
        <path d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.2.3 34 .3 34 .3s-21.2 0-26.5 1.4a8.5 8.5 0 0 0-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.5 8.5 0 0 0 6 6C12.8 47.7 34 47.7 34 47.7s21.2 0 26.5-1.4a8.5 8.5 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" fill="#f00" />
        <path d="M45 24 27 14v20" fill="#fff" />
      </svg>
    </button>
  );
}
