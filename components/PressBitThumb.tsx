"use client";

import { useEffect, useRef, useState } from "react";
import YoutubeThumbImage from "@/components/YoutubeThumbImage";
import { extractYoutubeId, youtubeThumb } from "@/lib/siteVideos";
import type { PressBit } from "@/lib/pressBitTypes";

type PressBitThumbProps = {
  item: Pick<PressBit, "title" | "image" | "videoUrl" | "sourceType">;
};

function UploadedVideoFrame({ src, alt }: { src: string; alt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameUrl, setFrameUrl] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFrameUrl("");
    setFailed(false);

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };

    const capture = () => {
      try {
        const width = video.videoWidth || 720;
        const height = video.videoHeight || 1280;
        if (!width || !height) {
          if (!cancelled) setFailed(true);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          if (!cancelled) setFailed(true);
          return;
        }
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        if (!cancelled) setFrameUrl(dataUrl);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        cleanup();
      }
    };

    video.addEventListener("loadeddata", () => {
      try {
        // Seek slightly in so the first keyframe is visible.
        if (video.duration && Number.isFinite(video.duration)) {
          video.currentTime = Math.min(0.35, video.duration * 0.05);
        } else {
          capture();
        }
      } catch {
        capture();
      }
    });
    video.addEventListener("seeked", capture);
    video.addEventListener("error", () => {
      if (!cancelled) setFailed(true);
      cleanup();
    });

    video.src = src;

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [src]);

  if (frameUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={frameUrl}
        alt={alt}
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ objectFit: "cover" }}
      />
    );
  }

  if (failed) {
    return (
      <video
        ref={videoRef}
        src={`${src}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ objectFit: "cover" }}
      />
    );
  }

  return <span className="position-absolute top-0 start-0 w-100 h-100 bg-dark" aria-hidden="true" />;
}

export default function PressBitThumb({ item }: PressBitThumbProps) {
  const youtubeId = extractYoutubeId(item.videoUrl);
  const isYoutube = item.sourceType === "youtube" || Boolean(youtubeId);
  const storedImage = item.image?.trim() || "";
  const youtubeFallback = youtubeId ? youtubeThumb(item.videoUrl) : "";

  if (isYoutube) {
    return (
      <YoutubeThumbImage
        src={storedImage || youtubeFallback}
        youtubeUrl={item.videoUrl}
        alt={item.title}
        className="object-fit-cover"
        sizes="(max-width:768px) 50vw, 25vw"
      />
    );
  }

  if (storedImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={storedImage}
        alt={item.title}
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ objectFit: "cover" }}
        loading="eager"
        decoding="async"
      />
    );
  }

  if (item.videoUrl) {
    return <UploadedVideoFrame src={item.videoUrl} alt={item.title} />;
  }

  return <span className="position-absolute top-0 start-0 w-100 h-100 bg-dark" aria-hidden="true" />;
}
