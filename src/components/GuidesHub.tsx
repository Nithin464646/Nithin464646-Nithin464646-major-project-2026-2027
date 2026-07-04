import React, { useState, useEffect } from "react";
import { Search, BookOpen, Video, Target, Info, Check, Play, Book, Leaf, Droplets, Bug, Cpu } from "lucide-react";
import { EducationalGuide } from "../types";

export default function GuidesHub() {
  const [guides, setGuides] = useState<EducationalGuide[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string>("drone");

  const loadGuides = async () => {
    setLoading(true);
    try {
      let url = "/api/guides";
      if (category) url += `?category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      const data = await res.json();
      setGuides(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadGuides(); }, [category]);

  const filteredGuides = guides.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  const hotspots = {
    drone: {
      title: "Autonomous Scouting Quadcopter",
      text: "Equipped with multispectral imagery sensors. Scans chlorophyll indices, locates water stress, and charts thermal topography maps."
    },
    nozzles: {
      title: "Atmospheric Drip Hydration",
      text: "Drip lines embedded with sub-surface moisture feedback valves. Minimizes water vaporization by delivering fluids directly to root hairs."
    },
    sensors: {
      title: "Soil Electro-Chemical Cells",
      text: "Continuous telemetry modules measuring soil NPK ions, acidity (pH), and local dielectric water moisture constants."
    }
  };

  const categories = [
    { tag: "", label: "All Guides", icon: BookOpen },
    { tag: "Organic Farming", label: "Organic Farming", icon: Leaf },
    { tag: "Pest Control", label: "Pest Control", icon: Bug },
    { tag: "Irrigation", label: "Irrigation", icon: Droplets },
    { tag: "Smart Farming", label: "Smart Farming", icon: Cpu },
  ];

  return (
    <div id="guides-hub-root" className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Education Hub</p>
          <h2 className="text-2xl font-bold text-[#1a2e1c] mt-0.5">Guides & Featured Videos</h2>
        </div>
        <button className="btn-outline text-sm">View All</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT: Category filters + farm lab */}
        <div className="xl:col-span-4 space-y-5">

          {/* Category filter */}
          <div className="bg-white border border-[#d1e4d5] rounded-xl p-5">
            <h5 className="text-xs font-bold text-[#1a5c38] uppercase tracking-wider mb-3">Subject Categories</h5>
            <div className="space-y-1.5">
              {categories.map((item) => (
                <button key={item.tag} onClick={() => setCategory(item.tag)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                    category === item.tag
                      ? "bg-[#1a5c38] text-white font-semibold"
                      : "text-[#4a6550] hover:bg-[#edf4ee]"
                  }`}>
                  <span className="flex items-center gap-2.5"><item.icon className="w-4 h-4" />{item.label}</span>
                  {category === item.tag && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Farm lab interactive */}
          <div className="bg-white border border-[#d1e4d5] rounded-xl p-5">
            <p className="section-label mb-1">Interactive Lab</p>
            <h4 className="text-sm font-bold text-[#1a2e1c] mb-3">Smart Farm Technology</h4>

            {/* Visual placeholder (replaces heavy ThreeFarmScene) */}
            <div className="relative h-40 rounded-xl bg-gradient-to-br from-[#edf4ee] to-[#d1e4d5] border border-[#c5ddc9] mb-4 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 opacity-20">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div key={i} className="border border-[#1a5c38]/30" />
                ))}
              </div>
              <div className="text-center z-10 p-4">
                <div className="w-16 h-16 mx-auto bg-[#1a5c38]/10 rounded-full flex items-center justify-center mb-2">
                  <Cpu className="w-8 h-8 text-[#1a5c38]" />
                </div>
                <p className="text-xs font-semibold text-[#1a5c38]">Smart Farm Model</p>
              </div>
            </div>

            {/* Hotspot buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { key: "drone", label: "AI Drone" },
                { key: "nozzles", label: "Smart Nozzles" },
                { key: "sensors", label: "Soil Cells" },
              ].map(btn => (
                <button key={btn.key} id={`hs-${btn.key}`} onClick={() => setActiveHotspot(btn.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                    activeHotspot === btn.key
                      ? "bg-[#1a5c38] text-white border-[#1a5c38]"
                      : "border-[#d1e4d5] text-[#4a6550] hover:border-[#1a5c38] hover:text-[#1a5c38]"
                  }`}>{btn.label}</button>
              ))}
            </div>

            {activeHotspot && hotspots[activeHotspot as keyof typeof hotspots] && (
              <div className="p-3.5 rounded-lg border border-green-100 bg-green-50">
                <h5 className="text-xs font-bold text-[#1a5c38] flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3.5 h-3.5" /> {hotspots[activeHotspot as keyof typeof hotspots].title}
                </h5>
                <p className="text-xs text-[#4a6550] leading-relaxed">
                  {hotspots[activeHotspot as keyof typeof hotspots].text}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Guide cards */}
        <div className="xl:col-span-8">
          <div className="bg-white border border-[#d1e4d5] rounded-xl p-6">
            {/* Search */}
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a9a80]" />
              <input id="guide-text-search" type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search farming manuals and videos..."
                className="w-full pl-9 pr-4 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38]" />
            </div>

            {loading ? (
              <div className="text-center py-16 text-[#7a9a80]">Loading guides...</div>
            ) : filteredGuides.length === 0 ? (
              <div className="text-center py-16 text-[#7a9a80] text-sm">No guides found. Reset filter.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGuides.map((g) => (
                  <div key={g.id} className="border border-[#e8f2e9] rounded-xl overflow-hidden hover:shadow-md hover:border-[#a8cbb0] transition-all bg-[#f4f8f4]">
                    {/* Thumbnail area */}
                    <div className="h-32 bg-gradient-to-br from-[#1a5c38] to-[#2e7d52] flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="z-10 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/60">
                        {g.type.includes("video") ? (
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        ) : (
                          <Book className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span className="absolute bottom-2 right-2 text-xs text-white bg-black/40 px-2 py-0.5 rounded font-mono">
                        {g.type === "video2d" || g.type === "video3d" ? "VIDEO" : "GUIDE"}
                      </span>
                    </div>

                    <div className="p-4">
                      <span className="badge-green mb-2">{g.category}</span>
                      <h4 className="text-sm font-bold text-[#1a2e1c] leading-tight mt-1">{g.title}</h4>
                      <p className="text-xs text-[#7a9a80] leading-relaxed mt-1.5 line-clamp-2">{g.description}</p>

                      <div className="mt-3 pt-3 border-t border-[#e8f2e9] flex items-center justify-between">
                        <p className="text-xs text-[#7a9a80]">By <span className="text-[#4a6550] font-semibold">{g.author}</span></p>
                        <a href={g.url} target="_blank" rel="noreferrer"
                          className={`inline-flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-colors ${
                            g.type.includes("video")
                              ? "bg-[#1a5c38] text-white hover:bg-[#134429]"
                              : "border border-[#1a5c38] text-[#1a5c38] hover:bg-[#1a5c38] hover:text-white"
                          }`}>
                          {g.type.includes("video") ? <><Play className="w-3 h-3 fill-current" />Watch</> : <><Info className="w-3 h-3" />Read</>}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
