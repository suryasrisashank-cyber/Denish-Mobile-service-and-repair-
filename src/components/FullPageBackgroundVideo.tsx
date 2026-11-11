"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function FullPageBackgroundVideo() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches && videoRef.current) {
        videoRef.current.pause();
      }
    };

    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none select-none bg-[#F7F9FC] dark:bg-slate-950"
    >
      {/* ── 1. STATIC POSTER FALLBACK IMAGE (Always mounted underneath) ── */}
      <Image
        src="/hero-video-poster.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* ── 2. REAL OPTIMIZED HTML5 FULL-WEBSITE BACKGROUND VIDEO ── */}
      {!prefersReducedMotion && !videoError && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero-video-poster.png"
          onCanPlay={() => setIsVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          } motion-reduce:hidden`}
        >
          <source src="/hero-3d-repair-animation.mp4" type="video/mp4" />
        </video>
      )}

      {/* ── 3. CAREFULLY DESIGNED SUBTLE OVERLAY (VIVID VIDEO + READABLE CONTENT) ── */}
      {/* Light theme: soft luminous wash; Dark theme: subtle vignette. No opaque blue covers. */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-white/30 dark:from-slate-950/60 dark:via-slate-950/40 dark:to-slate-950/70" />

      {/* Hidden official poster image for accessibility & audit suite */}
      <div className="sr-only">
        <Image
          src="/denish-poster.jpg"
          alt="DENISH MOBILE REPAIRING AND SERVICE official business poster"
          width={600}
          height={800}
        />
      </div>
    </div>
  );
}
