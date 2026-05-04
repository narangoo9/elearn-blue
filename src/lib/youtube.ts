const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function cleanVideoId(value: string | null | undefined): string | null {
  if (!value) return null;
  const [candidate] = value.split(/[?&#/]/);
  return VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
}

export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase();
    if (!YOUTUBE_HOSTS.has(host)) return null;

    if (host.endsWith("youtu.be")) {
      return cleanVideoId(parsed.pathname.split("/").filter(Boolean)[0]);
    }

    if (parsed.pathname === "/watch") {
      return cleanVideoId(parsed.searchParams.get("v"));
    }

    const [kind, id] = parsed.pathname.split("/").filter(Boolean);
    if (kind === "embed" || kind === "shorts") {
      return cleanVideoId(id);
    }

    return null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(
  url: string,
  options?: { startTimeSeconds?: number; endTimeSeconds?: number },
): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;

  const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
  if (options?.startTimeSeconds != null && options.startTimeSeconds > 0) params.set("start", String(options.startTimeSeconds));
  if (options?.endTimeSeconds != null && options.endTimeSeconds > 0) params.set("end", String(options.endTimeSeconds));

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function isValidYouTubeUrl(url: string): boolean {
  return getYouTubeVideoId(url) !== null;
}
