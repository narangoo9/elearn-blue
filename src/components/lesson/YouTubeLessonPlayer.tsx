"use client";

import { AlertCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

interface YouTubeLessonPlayerProps {
  url: string;
  title?: string;
  className?: string;
  onCompleted?: () => void;
}

export function YouTubeLessonPlayer({
  url,
  title = "EduNity lesson video",
  className,
}: YouTubeLessonPlayerProps) {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-red-100 bg-white p-6 shadow-[0_16px_45px_rgba(124,58,237,0.12)]",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">YouTube холбоос буруу байна.</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Raw YouTube URL хадгалаад, EduNity дотор аюулгүй embed болгож үзүүлнэ.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-violet-100 bg-slate-950 shadow-[0_18px_50px_rgba(109,40,217,0.24)]",
        className,
      )}
    >
      <div className="relative aspect-video">
        <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
          <PlayCircle size={13} />
          YouTube видео
        </div>
        <iframe
          src={embedUrl}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
