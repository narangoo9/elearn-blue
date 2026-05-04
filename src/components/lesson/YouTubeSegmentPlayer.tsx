"use client";

import { PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";

interface YouTubeSegmentPlayerProps {
  videoId: string;
  lessonId: string;
  title?: string;
  className?: string;
  startTimeSeconds?: number;
  endTimeSeconds?: number;
  onProgress?: (playedSeconds: number) => void;
  onCompleted?: () => void;
}

export function YouTubeSegmentPlayer({
  videoId,
  title = "EduNity lesson video",
  className,
  startTimeSeconds,
  endTimeSeconds,
}: YouTubeSegmentPlayerProps) {
  const embedUrl = getYouTubeEmbedUrl(`https://youtu.be/${videoId}`, {
    startTimeSeconds,
    endTimeSeconds,
  });
  const thumbnail = getYouTubeThumbnailUrl(videoId);

  if (!embedUrl) {
    return (
      <div className={cn("rounded-2xl border border-red-100 bg-white p-6 shadow-[0_16px_45px_rgba(124,58,237,0.12)]", className)}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <PlayCircle size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">YouTube видео татаж чадсангүй.</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Видео холбоосоо шалгаад дахин оруулна уу.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-violet-100 bg-slate-950 shadow-[0_18px_50px_rgba(109,40,217,0.24)]", className)}>
      <div className="relative aspect-video bg-black">
        {thumbnail ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbnail})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
          <PlayCircle size={13} /> YouTube сегмент
        </div>
        <iframe
          src={embedUrl}
          title={title}
          className="relative h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <div className="flex flex-col gap-2 border-t border-white/10 px-4 py-3 text-xs text-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-900/60 px-2 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-200">
            {startTimeSeconds != null || endTimeSeconds != null ? "Видео сегмент" : "Бүрэн видео"}
          </span>
          {startTimeSeconds != null || endTimeSeconds != null ? (
            <span>
              {startTimeSeconds != null ? `${startTimeSeconds}s` : "0s"} — {endTimeSeconds != null ? `${endTimeSeconds}s` : "end"}
            </span>
          ) : null}
        </div>
        <span className="truncate text-slate-200/90">{title}</span>
      </div>
    </div>
  );
}
