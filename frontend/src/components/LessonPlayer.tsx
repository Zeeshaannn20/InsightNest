"use client";

import { useEffect, useRef } from "react";

/**
 * Video surface that reports playback position.
 *
 * YouTube is embedded through its IFrame Player API rather than a plain iframe,
 * because a plain iframe gives no way to read the current time or seek — both
 * of which we need for resume and progress.
 *
 * Anything that isn't a YouTube link falls back to a native <video> element.
 */

type Props = {
  /** Raw lesson URL, YouTube or direct media. */
  videoUrl: string | null;
  title: string | null;
  /** Seconds to resume from. */
  startAtSec?: number;
  /** Fires roughly every 10s while playing, and on pause. */
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: () => void;
};

const PROGRESS_INTERVAL_MS = 10_000;

export function getYouTubeId(url: string): string | null {
  const match = url.match(
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  );
  return match && match[2]?.length === 11 ? match[2] : null;
}

let apiPromise: Promise<void> | null = null;

/** Load the IFrame API once per page. */
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as unknown as Record<string, unknown>;
  if (w.YT && (w.YT as { Player?: unknown }).Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve) => {
    const previous = w.onYouTubeIframeAPIReady as (() => void) | undefined;
    w.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);
  });
  return apiPromise;
}

export default function LessonPlayer({
  videoUrl,
  title,
  startAtSec = 0,
  onProgress,
  onEnded,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep callbacks in refs so re-renders don't tear down the player.
  const onProgressRef = useRef(onProgress);
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onProgressRef.current = onProgress;
    onEndedRef.current = onEnded;
  }, [onProgress, onEnded]);

  const youTubeId = videoUrl ? getYouTubeId(videoUrl) : null;

  useEffect(() => {
    if (!youTubeId || !mountRef.current) return;

    let cancelled = false;
    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const report = () => {
      const player = playerRef.current;
      if (!player?.getCurrentTime) return;
      onProgressRef.current?.(player.getCurrentTime() ?? 0, player.getDuration?.() ?? 0);
    };

    loadYouTubeApi().then(() => {
      if (cancelled || !mountRef.current) return;
      const YT = (window as any).YT;

      playerRef.current = new YT.Player(mountRef.current, {
        videoId: youTubeId,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1, start: Math.floor(startAtSec) },
        events: {
          onReady: (e: any) => {
            // start= is unreliable after a cued load, so seek explicitly
            if (startAtSec > 5) e.target.seekTo(startAtSec, true);
            e.target.playVideo?.();
          },
          onStateChange: (e: any) => {
            const state = e.data;
            if (state === YT.PlayerState.PLAYING) {
              stopTimer();
              timerRef.current = setInterval(report, PROGRESS_INTERVAL_MS);
            } else {
              stopTimer();
              if (state === YT.PlayerState.PAUSED) report();
              if (state === YT.PlayerState.ENDED) {
                report();
                onEndedRef.current?.();
              }
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      stopTimer();
      report();
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
    // Recreate only when the video itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youTubeId]);

  if (!videoUrl) {
    return (
      <div className="text-center text-outline">
        <span className="material-symbols-outlined text-6xl mb-2">video_library</span>
        <p>Select a lesson from the syllabus or a recording to start learning.</p>
      </div>
    );
  }

  if (youTubeId) {
    // YT.Player replaces this node with its own iframe.
    return <div ref={mountRef} className="w-full h-full" />;
  }

  return (
    <video
      key={videoUrl}
      src={videoUrl}
      title={title ?? "Lesson video"}
      controls
      autoPlay
      className="w-full h-full bg-black"
      onLoadedMetadata={(e) => {
        if (startAtSec > 5) e.currentTarget.currentTime = startAtSec;
      }}
      onTimeUpdate={(e) => {
        const el = e.currentTarget;
        // native timeupdate fires ~4x/s; throttle to the same cadence as YouTube
        if (Math.floor(el.currentTime) % 10 === 0) {
          onProgressRef.current?.(el.currentTime, el.duration || 0);
        }
      }}
      onPause={(e) =>
        onProgressRef.current?.(e.currentTarget.currentTime, e.currentTarget.duration || 0)
      }
      onEnded={() => onEndedRef.current?.()}
    />
  );
}
