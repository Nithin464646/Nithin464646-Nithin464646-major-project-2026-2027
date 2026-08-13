import React, { useState, useEffect, useRef } from "react";
import {
  Search, BookOpen, Leaf, Droplets, Bug, Cpu, Sprout, Check,
  Play, Pause, Volume2, VolumeX, Maximize, X, Film, ChevronRight
} from "lucide-react";

import { Language } from "../types";
import { getTranslation } from "../utils/translations";

interface VideoItem {
  id: string;
  filename: string;
  title: string;
  category: string;
  url: string;
  type: string;
  duration: string;
  size: string;
}

interface GuidesHubProps {
  currentLanguage?: Language;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Irrigation":      Droplets,
  "Organic Farming": Leaf,
  "Pest Control":    Bug,
  "Smart Farming":   Cpu,
  "Fertilizers":     Sprout,
  "Crop Management": Sprout,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Irrigation":      "bg-blue-50 text-blue-700 border-blue-200",
  "Organic Farming": "bg-green-50 text-green-700 border-green-200",
  "Pest Control":    "bg-red-50 text-red-700 border-red-200",
  "Smart Farming":   "bg-purple-50 text-purple-700 border-purple-200",
  "Fertilizers":     "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Crop Management": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// ─── Inline HTML5 Video Player ─────────────────────────────────────────────
interface VideoPlayerProps {
  video: VideoItem;
  onClose: () => void;
}

function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [speed, setSpeed] = useState(1);
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); } else { videoRef.current.play(); }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime: ct, duration: dur } = videoRef.current;
    setCurrentTime(fmt(ct));
    setProgress(dur ? (ct / dur) * 100 : 0);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(fmt(videoRef.current.duration));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = Number(e.target.value);
    videoRef.current.currentTime = (val / 100) * videoRef.current.duration;
    setProgress(val);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  const handleSpeed = (s: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = s;
    setSpeed(s);
  };

  // Auto-play on open
  useEffect(() => {
    setTimeout(() => {
      videoRef.current?.play().then(() => setPlaying(true)).catch(() => {});
    }, 200);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0f1a0f] rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl border border-[#1a5c38]/40"
        onClick={e => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#1a2e1c] border-b border-[#1a5c38]/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <Film className="w-4 h-4 text-[#1a5c38] flex-shrink-0" />
            <span className="text-white text-sm font-semibold truncate">{video.title}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${CATEGORY_COLORS[video.category] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
              {video.category}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video element */}
        <div className="relative bg-black">
          <video
            ref={videoRef}
            src={video.url}
            className="w-full max-h-[65vh] object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-3 bg-[#1a2e1c] space-y-2">
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#7a9a80] w-10 flex-shrink-0">{currentTime}</span>
            <input
              type="range" min={0} max={100} step={0.1}
              value={progress}
              onChange={handleSeek}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-[#1a5c38] bg-white/20"
            />
            <span className="text-[11px] font-mono text-[#7a9a80] w-10 text-right flex-shrink-0">{duration}</span>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="w-9 h-9 bg-[#1a5c38] hover:bg-[#2e7d52] rounded-full flex items-center justify-center transition-colors">
                {playing
                  ? <Pause className="w-4 h-4 text-white fill-white" />
                  : <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                }
              </button>

              {/* Mute */}
              <button onClick={toggleMute} className="p-1.5 text-white/60 hover:text-white transition-colors">
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Speed selector */}
              <div className="flex items-center gap-1">
                {speeds.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSpeed(s)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                      speed === s ? "bg-[#1a5c38] text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>

              {/* Fullscreen */}
              <button onClick={handleFullscreen} className="p-1.5 text-white/60 hover:text-white transition-colors" title="Fullscreen">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main GuidesHub Component ───────────────────────────────────────────────
export default function GuidesHub() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    fetch("/api/videos")
      .then(r => r.json())
      .then(json => {
        if (json.status === "success") setVideos(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const availableCategories: string[] = Array.from(new Set(videos.map(v => v.category)));

  const filtered = videos.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category ? v.category === category : true;
    return matchSearch && matchCat;
  });

  const sidebarCategories = [
    { tag: "", label: "All Videos", icon: BookOpen },
    ...availableCategories.map(cat => ({
      tag: cat,
      label: cat,
      icon: CATEGORY_ICONS[cat] || Sprout
    }))
  ];

  return (
    <div id="guides-hub-root" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Edu Hub
          </p>
          <h2 className="text-2xl font-bold text-[#1a2e1c] mt-0.5">Edu Hub — Expert Agricultural Learning</h2>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-[#166534] text-white text-xs font-bold">
          {videos.length} video{videos.length !== 1 ? "s" : ""} available
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT: Category sidebar */}
        <div className="xl:col-span-3 space-y-5">
          <div className="bg-white border border-[#d1e4d5] rounded-2xl p-5">
            <h5 className="text-xs font-bold text-[#1a5c38] uppercase tracking-wider mb-3">Categories</h5>
            <div className="space-y-1.5">
              {sidebarCategories.map(item => (
                <button
                  key={item.tag}
                  onClick={() => setCategory(item.tag)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                    category === item.tag
                      ? "bg-[#1a5c38] text-white font-semibold shadow-md"
                      : "text-[#4a6550] hover:bg-[#f0f6f1] hover:text-[#166534]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {category === item.tag && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Info card */}
          <div className="bg-gradient-to-br from-[#14532d] to-[#166534] border border-[#d1e4d5] rounded-xl p-5">
            <h5 className="text-xs font-bold text-green-300 uppercase tracking-wider mb-2">How to Watch</h5>
            <ul className="space-y-2">
              {[
                "Click any video card to open the player",
                "Use speed controls to adjust playback",
                "Press fullscreen for a larger view",
                "Click outside the player to close"
              ].map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/80">
                  <ChevronRight className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT: Video grid */}
        <div className="xl:col-span-9">
          <div className="bg-white border border-[#d1e4d5] rounded-xl p-6">

            {/* Featured video card */}
            {!loading && filtered.length > 0 && (
              <div
                onClick={() => setPlayingVideo(filtered[0])}
                className="mb-5 rounded-2xl overflow-hidden border border-[#d1e4d5] cursor-pointer group hover:shadow-lg transition-all"
              >
                <div className="relative h-44 bg-gradient-to-br from-[#14532d] via-[#166534] to-[#15803d] flex items-center justify-center">
                  <div className="absolute inset-0 hero-grid-pattern" />
                  <div className="z-10 text-center">
                    <div className="w-16 h-16 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center border-2 border-white/50 mx-auto mb-3 transition-all group-hover:scale-110">
                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                    </div>
                    <p className="text-green-300 text-xs font-semibold uppercase tracking-widest">Featured Guide</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h4 className="text-white font-bold text-lg leading-tight">{filtered[0].title}</h4>
                    <p className="text-white/70 text-xs mt-1">{filtered[0].category} • Click to watch</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a9a80]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search videos by title..."
                className="w-full pl-9 pr-4 py-2.5 border border-[#d1e4d5] rounded-xl shadow-sm text-sm focus:outline-none focus:border-[#1a5c38]"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#7a9a80]">
                <div className="w-8 h-8 border-2 border-[#1a5c38] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading videos...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <Film className="w-12 h-12 text-[#d1e4d5]" />
                <h4 className="text-base font-bold text-[#1a2e1c]">
                  {videos.length === 0
                    ? "No educational videos available at the moment."
                    : "No videos match your search."}
                </h4>
                {videos.length === 0 ? (
                  <p className="text-sm text-[#7a9a80] max-w-sm">
                    Add video files to the <code className="bg-[#f4f8f4] px-1.5 py-0.5 rounded text-xs border border-[#d1e4d5]">videos/</code> folder and they will appear here automatically.
                  </p>
                ) : (
                  <button onClick={() => { setSearch(""); setCategory(""); }} className="text-xs text-[#1a5c38] hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(video => {
                  const CatIcon = CATEGORY_ICONS[video.category] || Sprout;
                  return (
                    <div
                      key={video.id}
                      onClick={() => setPlayingVideo(video)}
                      className="group border border-[#e8f2e9] rounded-xl overflow-hidden hover:shadow-md hover:border-[#1a5c38]/40 transition-all cursor-pointer bg-[#f4f8f4]"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-40 bg-gradient-to-br from-[#1a5c38] to-[#2e7d52] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute top-3 left-3 z-20">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[video.category] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            <CatIcon className="w-3 h-3" />{video.category}
                          </span>
                        </div>
                        <div className="z-10 w-16 h-16 bg-white/25 group-hover:bg-white/40 rounded-full flex items-center justify-center border-2 border-white/60 transition-all group-hover:scale-110">
                          <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                        </div>
                        {video.size && (
                          <span className="absolute bottom-2 left-2 text-[10px] text-white/80 bg-black/40 px-1.5 py-0.5 rounded font-mono">
                            {video.size}
                          </span>
                        )}
                        <span className="absolute bottom-2 right-2 text-[10px] text-white bg-black/50 px-2 py-0.5 rounded font-mono uppercase">
                          MP4
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mb-2 ${CATEGORY_COLORS[video.category] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          <CatIcon className="w-3 h-3" />
                          {video.category}
                        </span>
                        <h4 className="text-sm font-bold text-[#1a2e1c] leading-snug line-clamp-2">
                          {video.title}
                        </h4>
                        <p className="text-xs text-[#7a9a80] mt-2 flex items-center gap-1">
                          <Film className="w-3 h-3" /> Click to watch
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
        />
      )}
    </div>
  );
}
