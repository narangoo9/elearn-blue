import {
  getYouTubeEmbedUrl,
  getYouTubeVideoId,
  isValidYouTubeUrl,
} from "@/lib/youtube";

describe("YouTube URL utilities", () => {
  const videoId = "dQw4w9WgXcQ";

  it.each([
    `https://www.youtube.com/watch?v=${videoId}`,
    `https://www.youtube.com/watch?v=${videoId}&t=30s`,
    `https://youtu.be/${videoId}`,
    `https://youtu.be/${videoId}?si=abc`,
    `https://www.youtube.com/embed/${videoId}`,
    `https://www.youtube.com/shorts/${videoId}`,
  ])("extracts a video id from %s", (url) => {
    expect(getYouTubeVideoId(url)).toBe(videoId);
    expect(getYouTubeEmbedUrl(url)).toBe(
      `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`,
    );
    expect(isValidYouTubeUrl(url)).toBe(true);
  });

  it("does not crash or validate playlist-only URLs", () => {
    const playlistUrl = "https://www.youtube.com/playlist?list=PL123";

    expect(getYouTubeVideoId(playlistUrl)).toBeNull();
    expect(getYouTubeEmbedUrl(playlistUrl)).toBeNull();
    expect(isValidYouTubeUrl(playlistUrl)).toBe(false);
  });

  it("rejects non-YouTube URLs", () => {
    expect(getYouTubeVideoId("https://example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(isValidYouTubeUrl("not a url")).toBe(false);
  });
});
