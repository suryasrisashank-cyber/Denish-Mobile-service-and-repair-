import React, { useState, useEffect, useRef } from 'react';
import { Video, Image as ImageIcon, EyeOff } from 'lucide-react';

interface BackgroundVideoProps {
  dimLevel?: 'normal' | 'extra';
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ dimLevel = 'normal' }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // High-performance royalty-free ambient electronic workshop video stream URL
  // (Pexels tech micro-soldering / smartphone lab video)
  const videoSrc = 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-details-and-components-41484-large.mp4';
  
  // High-resolution local lab showcase image from workspace assets
  const staticFallback = '/assets/aistudio/IMG_20261109_185606_267_4219b34c.jpg';

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setIsVideoActive(false);
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVideoActive(false);
    }
  }, [prefersReducedMotion]);

  const toggleVideo = () => {
    setIsVideoActive((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Fallback Static Workshop Image */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          isVideoActive && videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `url(${staticFallback})`,
          backgroundPosition: 'center 20%',
        }}
      />

      {/* Video Element */}
      {isVideoActive && !prefersReducedMotion && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded && !videoError ? 'opacity-40 dark:opacity-30' : 'opacity-0'
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* High-Readability Theme Scrim Overlays */}
      {/* Light Theme: Subtle clean gradient with high contrast */}
      <div
        className={`absolute inset-0 transition-colors duration-300 ${
          dimLevel === 'extra'
            ? 'bg-slate-50/95 dark:bg-[#101820]/95 backdrop-blur-[2px]'
            : 'bg-gradient-to-b from-white/95 via-slate-50/90 to-white/95 dark:from-[#101820]/95 dark:via-[#101c2c]/92 dark:to-[#101820]/95 backdrop-blur-[1px]'
        }`}
      />

      {/* Subtle Ambient Radial Highlight for Brand Gold & Electric Blue */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-sky-500/5 dark:bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[400px] bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Discrete Ambient Mode Controller in Bottom Corner */}
      <div className="pointer-events-auto absolute bottom-20 md:bottom-4 right-4 z-20">
        <button
          onClick={toggleVideo}
          type="button"
          title={isVideoActive ? 'Switch to static workshop background' : 'Enable ambient workshop video'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-sm transition-all active:scale-95"
        >
          {isVideoActive ? (
            <>
              <Video className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
              <span className="hidden sm:inline text-[11px]">Video Background</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline text-[11px]">Static Backdrop</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
