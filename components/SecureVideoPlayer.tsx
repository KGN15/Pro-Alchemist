"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize } from "lucide-react";

type Props = {
  videoId: string;
  title: string;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function SecureVideoPlayer({ videoId, title }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // YouTube API Load
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    }

    function initPlayer() {
      playerRef.current = new window.YT.Player(`player-${videoId}`, {
        videoId: videoId,
        playerVars: {
          controls: 0,          // ইউটিউব কন্ট্রোল হাইড
          modestbranding: 1,    // লোগো কমানো
          rel: 0,               // রিলেটেড ভিডিও বন্ধ
          showinfo: 0,
          disablekb: 1,         // কিবোর্ড শর্টকাট বন্ধ
          iv_load_policy: 3,
          fs: 0,                // ফুলস্ক্রিন বাটন বন্ধ
        },
        events: {
          onReady: () => setIsReady(true),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            else setIsPlaying(false);
          },
        },
      });
    }

    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) setProgress((current / duration) * 100);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [videoId]);

  const togglePlay = () => {
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const toggleMute = () => {
    if (isMuted) playerRef.current.unMute();
    else playerRef.current.mute();
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = (playerRef.current.getDuration() * Number(e.target.value)) / 100;
    playerRef.current.seekTo(seekTo, true);
  };

  return (
    <div className="group relative space-y-3" onContextMenu={(e) => e.preventDefault()}>
      {/* Title Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase italic">
          {title}
        </h3>
      </div>

      <div ref={containerRef} className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/5 bg-black shadow-2xl">
        {/* YouTube IFrame (Hidden Layer) */}
        <div className="pointer-events-none absolute inset-0 h-full w-full scale-[1.05]">
          <div id={`player-${videoId}`} className="h-full w-full" />
        </div>

        {/* Custom Controller Overlay */}
        <div className={`absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 transition-opacity duration-300 ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
          
          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="mb-4 h-1 w-full cursor-pointer appearance-none bg-white/20 accent-red-600 transition-all hover:h-1.5"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={togglePlay} className="text-white hover:text-red-500 transition-colors">
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              
              <button onClick={() => playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10)} className="text-white/70 hover:text-white">
                <RotateCcw size={20} />
              </button>

              <button onClick={toggleMute} className="text-white/70 hover:text-white">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

            <div className="flex items-center gap-4">
               <span className="text-[10px] font-bold text-zinc-400 tracking-tighter">
                 PRO ALCHEMIST SECURE STREAM
               </span>
               <button onClick={() => containerRef.current?.requestFullscreen()} className="text-white/70 hover:text-white">
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Big Play Button (Center) */}
        {!isPlaying && isReady && (
          <button 
            onClick={togglePlay}
            className="absolute inset-0 z-30 m-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-600/10 border border-red-600/50 text-red-600 backdrop-blur-sm transition-transform hover:scale-110"
          >
            <Play size={32} fill="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
}