import React, { useState, useEffect } from "react";
import { 
  User as UserIcon, MessageSquare, ThumbsUp, Calendar, Heart, Bug, Calculator, 
  Sprout, Globe, Check, AlertCircle, Send, Sparkles, Sliders, RefreshCw 
} from "lucide-react";
import { User, ForumPost, Language } from "../types";

interface AddonsTabProps {
  userProfile: User | null;
  onUpdateProfile: (updated: User) => void;
}

export default function AddonsTab({ userProfile, onUpdateProfile }: AddonsTabProps) {
  const [panel, setPanel] = useState<"profile" | "forum" | "disease" | "calculator" | "calendar">("profile");

  // Profile Edit
  const [profName, setProfName] = useState(userProfile?.name || "");
  const [profPhone, setProfPhone] = useState(userProfile?.phone || "");
  const [profDistrict, setProfDistrict] = useState(userProfile?.district || "Kolar");
  const [profVillage, setProfVillage] = useState(userProfile?.village || "");
  const [profLand, setProfLand] = useState(userProfile?.landSize || 2.4);
  const [profCrops, setProfCrops] = useState(userProfile?.cropsGrown.join(", ") || "");
  const [profLang, setProfLang] = useState(userProfile?.preferredLanguage || Language.ENGLISH);
  const [savingProfile, setSavingProfile] = useState(false);

  // Community Forum State
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCrop, setNewPostCrop] = useState("Tomato");
  const [replyInputs, setReplyInputs] = useState<{ [postId: string]: string }>({});

  // Disease Scanner State
  const [diseaseInput, setDiseaseInput] = useState("");
  const [aiDiagnosis, setAiDiagnosis] = useState<any>(null);
  const [diagnosing, setDiagnosing] = useState(false);

  // Profitability/Yield Calc State
  const [calcCrop, setCalcCrop] = useState("Tomato");
  const [calcAcre, setCalcAcre] = useState(1);
  const [seedCost, setSeedCost] = useState(5000);
  const [fertCost, setFertCost] = useState(8000);
  const [laborCost, setLaborCost] = useState(6000);
  const [calcResult, setCalcResult] = useState<any>(null);

  // Feed/Toast alert
  const [toast, setToast] = useState("");

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // 1. Save Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName) return;
    setSavingProfile(true);
    try {
      const croparr = profCrops.split(",").map(c => c.trim()).filter(Boolean);
      const payload: User = {
        ...userProfile!,
        name: profName,
        phone: profPhone,
        district: profDistrict,
        village: profVillage,
        landSize: Number(profLand) || 0,
        cropsGrown: croparr,
        preferredLanguage: profLang
      };
      
      const res = await fetch("/api/auth/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onUpdateProfile(data.user);
        triggerToast("Farmer Profile updated successfully.");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Forums Functions
  const fetchForumPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/forum");
      const data = await res.json();
      setForumPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchForumPosts();
  }, []);

  const handleCreateForumPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    try {
      const res = await fetch("/api/forum/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: userProfile?.name || "Farmer",
          district: userProfile?.district || "Karnataka",
          role: "Farmer",
          crop: newPostCrop,
          content: newPostContent
        })
      });
      if (res.ok) {
        setNewPostContent("");
        triggerToast("Forum topic published.");
        fetchForumPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLikePost = async (id: string) => {
    try {
      const res = await fetch("/api/forum/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setForumPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = async (postId: string) => {
    const replyText = replyInputs[postId];
    if (!replyText || !replyText.trim()) return;

    try {
      const res = await fetch("/api/forum/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          author: userProfile?.name || "Farmer",
          role: "Farmer",
          content: replyText
        })
      });
      if (res.ok) {
        setReplyInputs(prev => ({ ...prev, [postId]: "" }));
        triggerToast("Reply posted.");
        fetchForumPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. AI Crop Disease Advisor
  const diagnoseCropDisease = () => {
    if (!diseaseInput.trim()) return;
    setDiagnosing(true);
    setAiDiagnosis(null);

    setTimeout(() => {
      const query = diseaseInput.toLowerCase();
      let disease = "Early Blight Fungus (Alternaria solani)";
      let causal = "High humidity waves paired with persistent leaf dampness.";
      let organic = "Equip organic copper hydroxide sprays. Prune bottom leaves to clear aeration lanes.";
      let chemical = "Mancozeb 75 WP (Indofil M-45) @ 2g per Liter of water.";

      if (query.includes("onion") || query.includes("rot")) {
        disease = "Purple Blotch Disease (Alternaria porri)";
        causal = "Fungal infection thriving on waterlogged, nitrogen-dense soils.";
        organic = "Dust fields with wood ash, implement 3-year crop rotation schedules.";
        chemical = "Propiconazole (Tilt 25 EC) @ 1ml/L of water.";
      } else if (query.includes("ragi") || query.includes("millet") || query.includes("blast")) {
        disease = "Ragi Finger Blast (Magnaporthe grisea)";
        causal = "Windborne spores colonizing millet grains under dry, cold dew.";
        organic = "Pre-treat seeds in bio-agent solutions (Pseudomonas fluorescens).";
        chemical = "Keneconazole / Tricyclazole @ 1g/L.";
      }

      setAiDiagnosis({ disease, causal, organic, chemical });
      setDiagnosing(false);
    }, 1100);
  };

  // 4. Profitability & Yield Estimation
  const handleCalculateProfit = () => {
    // Estimations constants depending on crops
    let avgYieldPerAcreTonnes = 12; // Tomato is high yield
    let expectedMandiPricePerTon = 18000; // Rs 18 per kg
    
    if (calcCrop === "Paddy (Rice)") {
      avgYieldPerAcreTonnes = 2.2;
      expectedMandiPricePerTon = 28000;
    } else if (calcCrop === "Ragi (Finger Millet)") {
      avgYieldPerAcreTonnes = 1.6;
      expectedMandiPricePerTon = 36000;
    } else if (calcCrop === "Onion") {
      avgYieldPerAcreTonnes = 8.5;
      expectedMandiPricePerTon = 24000;
    }

    const estimatedYieldTonnes = Number((avgYieldPerAcreTonnes * calcAcre).toFixed(1));
    const totalCostOfCultivation = Number(seedCost) + Number(fertCost) + Number(laborCost);
    const expectedRevenue = estimatedYieldTonnes * expectedMandiPricePerTon;
    const netProfit = expectedRevenue - totalCostOfCultivation;
    const returnOnInvestment = Number(((netProfit / totalCostOfCultivation) * 100).toFixed(1));

    setCalcResult({
      yield: estimatedYieldTonnes,
      revenue: expectedRevenue,
      cost: totalCostOfCultivation,
      profit: netProfit,
      roi: returnOnInvestment,
      rating: netProfit > 0 ? "Highly Profitable Output" : "Caution: Production cost exceeds projected Mandi revenues"
    });
  };

  useEffect(() => {
    handleCalculateProfit();
  }, [calcCrop, calcAcre, seedCost, fertCost, laborCost]);

  // Seasonal crop Sowing calendar
  const seasonalCalendar = [
    { season: "Kharif (June - October)", crop: "Paddy (Rice)", optimalMonth: "June Sowing", waterDemand: "High Hydration Required", yieldPotential: "Excellent" },
    { season: "Kharif (June - October)", crop: "Ragi (Finger Millet)", optimalMonth: "July Sowing", waterDemand: "Drought Stout", yieldPotential: "Steady stable" },
    { season: "Rabi (November - April)", crop: "Tomato", optimalMonth: "November Sowing", waterDemand: "Micro Drip Irrigation", yieldPotential: "Peak Value Output" },
    { season: "Rabi (November - April)", crop: "Onion", optimalMonth: "December Sowing", waterDemand: "Moisture Ventilation needed", yieldPotential: "Strong returns" },
    { season: "Zaid (March - June)", crop: "Watermelon / Groundnuts", optimalMonth: "March Sowing", waterDemand: "Low drought feeds", yieldPotential: "High profit" }
  ];

  return (
    <div id="addons-module-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      
      {/* Toast Alert pop */}
      {toast && (
        <div className="fixed bottom-6 left-6 p-3.5 bg-white border border-[#d1e4d5] text-xs text-[#1a5c38] rounded-xl shadow-2xl z-50 flex items-center gap-1.5 animate-bounce">
          <Check className="w-4.5 h-4.5 text-[#1a5c38]" /> {toast}
        </div>
      )}

      {/* Tabs list left navigation */}
      <div className="lg:col-span-3 flex flex-col gap-2 p-4 border border-[#d1e4d5] bg-white rounded-2xl shadow-sm">
        <p className="text-xs font-bold text-[#7a9a80] uppercase tracking-widest px-3 mb-2">Grower Addons</p>
        {[
          { tag: "profile", label: "Farmer Profile Settings", icon: UserIcon },
          { tag: "forum", label: "Farmer Community Forum", icon: MessageSquare },
          { tag: "disease", label: "AI Crop Disease Advisor", icon: Bug },
          { tag: "calculator", label: "Yield & Profit Calculator", icon: Calculator },
          { tag: "calendar", label: "Seasonal Sowing Calendar", icon: Calendar }
        ].map((item) => (
          <button
            key={item.tag}
            onClick={() => setPanel(item.tag as any)}
            className={`w-full text-left text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer border ${panel === item.tag ? "bg-[#1a5c38] border-[#1a5c38] text-white font-bold" : "border-transparent text-[#4a6550] hover:bg-[#edf4ee] hover:text-[#1a5c38]"}`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Center panel rendering */}
      <div className="lg:col-span-9 p-6 border border-[#d1e4d5] bg-white rounded-2xl min-h-120 shadow-sm">
        
        {/* VIEW 1: FARMER PROFILE EDIT */}
        {panel === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#1a5c38] tracking-wider uppercase">Identity Parameters</span>
              <h3 className="text-lg font-bold text-[#1a2e1c]">Farmer Registration Profile</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#4a6550]">Aadhaar Registered Name</label>
                <input
                  id="profile-name-input"
                  type="text"
                  value={profName}
                  onChange={e => setProfName(e.target.value)}
                  className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4a6550]">Contact / Mobile Number</label>
                <input
                  id="profile-phone-input"
                  type="tel"
                  value={profPhone}
                  onChange={e => setProfPhone(e.target.value)}
                  className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#4a6550]">District Region</label>
                <select
                  id="profile-district-select"
                  value={profDistrict}
                  onChange={e => setProfDistrict(e.target.value)}
                  className="w-full bg-white mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                >
                  {["Bengaluru Urban", "Bengaluru Rural", "Kolar", "Chikkaballapur", "Tumakuru", "Ramanagara", "Mandya", "Mysuru", "Hassan"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4a6550]">Village / Taluk</label>
                <input
                  id="profile-village-input"
                  type="text"
                  value={profVillage}
                  onChange={e => setProfVillage(e.target.value)}
                  className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4a6550]">Farming Land Holding (Acres)</label>
                <input
                  id="profile-land-input"
                  type="number"
                  value={profLand}
                  onChange={e => setProfLand(Number(e.target.value))}
                  className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#4a6550]">Crops Cultivated Today (commas)</label>
                <input
                  id="profile-crops-input"
                  type="text"
                  value={profCrops}
                  onChange={e => setProfCrops(e.target.value)}
                  className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4a6550]">System Preferred Language</label>
                <select
                  id="profile-language-select"
                  value={profLang}
                  onChange={e => setProfLang(e.target.value as Language)}
                  className="w-full bg-white mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                >
                  <option value={Language.ENGLISH}>English (Platform default)</option>
                  <option value={Language.KANNADA}>ಕನ್ನಡ (Kannada)</option>
                  <option value={Language.HINDI}>हिन्दी (Hindi)</option>
                  <option value={Language.TELUGU}>తెలుగు (Telugu)</option>
                  <option value={Language.TAMIL}>தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>

            <button
              id="btn-save-profile"
              type="submit"
              disabled={savingProfile}
              className="py-2.5 px-5 bg-[#1a5c38] text-white hover:bg-[#134429] font-bold rounded-xl cursor-pointer text-xs shadow-sm"
            >
              {savingProfile ? "Encrypting changes..." : "Save Profile Settings"}
            </button>
          </form>
        )}

        {/* VIEW 2: FARMER FORUMS DISCUSSION BOARD */}
        {panel === "forum" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#1a5c38] tracking-wider uppercase">Grower Community Forum</span>
              <h3 className="text-lg font-bold text-[#1a2e1c]">Farmer Interactive Bulletin Board</h3>
            </div>

            {/* Create new Post Form */}
            <form onSubmit={handleCreateForumPost} className="p-4 rounded-xl border border-[#d1e4d5] bg-[#f4f8f4] space-y-3">
              <textarea
                placeholder="Share a farming issue/tip with other Karnataka farmers..."
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                rows={2}
                className="w-full bg-white text-sm text-[#1a2e1c] border border-[#d1e4d5] rounded-xl p-3 focus:outline-none focus:border-[#1a5c38]"
                required
              />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#4a6550]">Reference Crop:</span>
                  <select
                    value={newPostCrop}
                    onChange={e => setNewPostCrop(e.target.value)}
                    className="bg-white text-xs text-[#1a2e1c] border border-[#d1e4d5] p-1 px-2 rounded-lg"
                  >
                    {["Tomato", "Onion", "Paddy (Rice)", "Ragi (Finger Millet)", "General Advice"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="py-1.5 px-4 bg-[#1a5c38] text-white hover:bg-[#134429] text-xs font-bold rounded-xl cursor-pointer shadow-sm"
                >
                  Publish Crop Ticket
                </button>
              </div>
            </form>

            {/* Thread Posts lists */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {forumPosts.map((post) => (
                <div key={post.id} className="p-4 rounded-xl border border-[#d1e4d5] bg-white space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#1a2e1c]">{post.author}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#edf4ee] border border-[#d1e4d5] text-[#1a5c38] uppercase">
                          {post.role}
                        </span>
                      </div>
                      <span className="text-xs text-[#7a9a80]">{post.district} • {new Date(post.timestamp).toLocaleDateString()}</span>
                    </div>

                    <span className="text-[10px] text-[#1a5c38] border border-[#d1e4d5] bg-[#f4f8f4] px-2 py-0.5 rounded-lg uppercase font-bold">
                      {post.crop}
                    </span>
                  </div>

                  <p className="text-sm text-[#4a6550] leading-relaxed">{post.content}</p>

                  {/* Likes and Reply controls */}
                  <div className="flex items-center gap-4 text-xs border-t border-[#e8f2e9] pt-2 text-[#7a9a80]">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-1 hover:text-[#1a5c38] cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Likes ({post.likes})
                    </button>
                    <span>|</span>
                    <span>Replies ({post.replies?.length || 0})</span>
                  </div>

                  {/* Replies lists inside card */}
                  {post.replies?.length > 0 && (
                    <div className="pl-4 border-l border-[#d1e4d5] space-y-3 pt-2">
                      {post.replies.map((rep) => (
                        <div key={rep.id} className="text-xs bg-[#f4f8f4] p-3 rounded-lg border border-[#e8f2e9]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-[#1a2e1c]">{rep.author}</span>
                            <span className="font-bold text-[9px] bg-white border border-[#d1e4d5] text-[#7a9a80] px-1.5 rounded uppercase">{rep.role}</span>
                          </div>
                          <p className="text-[#4a6550]">{rep.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input panel */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write your advice/answer..."
                      value={replyInputs[post.id] || ""}
                      onChange={e => setReplyInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleSendReply(post.id);
                      }}
                      className="flex-1 bg-[#f4f8f4] text-xs border border-[#d1e4d5] rounded-lg p-2 px-3 focus:outline-none focus:border-[#1a5c38] text-[#1a2e1c]"
                    />
                    <button
                      onClick={() => handleSendReply(post.id)}
                      className="p-2 px-4 bg-white border border-[#d1e4d5] hover:bg-[#edf4ee] text-[#1a5c38] font-bold rounded-lg text-xs cursor-pointer flex items-center shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: AI DISCOVERY CROP DISEASE ADVISOR */}
        {panel === "disease" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#1a5c38] tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#1a5c38]" /> Entomological Diagnostic Advisor
              </span>
              <h3 className="text-lg font-bold text-[#1a2e1c]">AI Crop Disease & Pest Scanner</h3>
            </div>

            <div className="p-4 rounded-xl border border-[#d1e4d5] bg-[#f4f8f4] space-y-4">
              <p className="text-sm text-[#4a6550] leading-normal">
                Describe the visual disease crop indicators or leaf spot characteristics (e.g., "spots on tomato leaves", "purple patches on onions", "rot signs"). Our advisory algorithm traces causal fungi and recommends targeted remedies.
              </p>

              <div className="flex gap-2">
                <input
                  id="disease-symptom-input"
                  type="text"
                  value={diseaseInput}
                  onChange={e => setDiseaseInput(e.target.value)}
                  placeholder="Describe crop leaf symptoms..."
                  className="flex-1 bg-white text-sm border border-[#d1e4d5] rounded-xl p-2.5 px-3 text-[#1a2e1c] focus:outline-none focus:border-[#1a5c38]"
                />
                <button
                  id="btn-diagnose-disease"
                  onClick={diagnoseCropDisease}
                  disabled={diagnosing}
                  className="py-2.5 px-4 bg-[#1a5c38] hover:bg-[#134429] text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
                >
                  {diagnosing ? "Scanning..." : "Diagnose Symptoms"}
                </button>
              </div>
            </div>

            {aiDiagnosis && (
              <div className="p-5 rounded-2xl border border-green-200 bg-green-50/30 space-y-4 shadow-sm animate-fade-in">
                <div className="flex items-center gap-1.5 text-[#1a5c38] font-bold text-sm uppercase">
                  <Bug className="w-4.5 h-4.5 text-[#1a5c38] animate-bounce" /> Diagnosis Output: {aiDiagnosis.disease}
                </div>

                <div className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <h5 className="font-bold text-[#1a2e1c]">Causal Agitation:</h5>
                    <p className="text-[#4a6550] mt-0.5">{aiDiagnosis.causal}</p>
                  </div>
                  <div className="border-t border-[#e8f2e9] pt-3">
                    <h5 className="font-bold text-[#1a5c38]">1. Organic Botanical Treatments:</h5>
                    <p className="text-[#4a6550] mt-0.5">{aiDiagnosis.organic}</p>
                  </div>
                  <div className="border-t border-[#e8f2e9] pt-3">
                    <h5 className="font-bold text-blue-750">2. Targeted Chemical Remedies (If severe):</h5>
                    <p className="text-[#4a6550] mt-0.5">{aiDiagnosis.chemical}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: CROP PROFITABILITY & YIELD ESTIMATION CALCULATOR */}
        {panel === "calculator" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#1a5c38] tracking-wider uppercase">Agronomic Financial Planning</span>
              <h3 className="text-lg font-bold text-[#1a2e1c]">Profitability Calculator & Yield Estimation</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Inputs Section */}
              <div className="md:col-span-5 p-5 rounded-xl border border-[#d1e4d5] bg-[#f4f8f4] space-y-4 flex flex-col justify-between shadow-sm">
                <div>
                  <label className="text-xs font-semibold text-[#4a6550]">Crop Classification</label>
                  <select
                    id="calc-crop-select"
                    value={calcCrop}
                    onChange={e => setCalcCrop(e.target.value)}
                    className="w-full bg-white mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-lg py-2.5 px-3 focus:outline-none focus:border-[#1a5c38]"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Onion">Onion</option>
                    <option value="Paddy (Rice)">Paddy (Rice)</option>
                    <option value="Ragi (Finger Millet)">Ragi (Finger Millet)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4a6550]">Acreage Coverage (Acres)</label>
                  <input
                    id="calc-acre-input"
                    type="number"
                    value={calcAcre}
                    onChange={e => setCalcAcre(Number(e.target.value))}
                    className="w-full bg-white mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-lg py-2.5 px-3 focus:outline-none focus:border-[#1a5c38]"
                  />
                </div>

                <div className="border-t border-[#d1e4d5] pt-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#4a6550] font-semibold">Est. Seeds Cost:</span>
                    <input
                      type="number"
                      value={seedCost}
                      onChange={e => setSeedCost(Number(e.target.value))}
                      className="w-24 text-right bg-white border border-[#d1e4d5] rounded p-1 text-[#1a2e1c] font-mono text-xs focus:outline-none focus:border-[#1a5c38]"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#4a6550] font-semibold">Est. Fertilizer:</span>
                    <input
                      type="number"
                      value={fertCost}
                      onChange={e => setFertCost(Number(e.target.value))}
                      className="w-24 text-right bg-white border border-[#d1e4d5] rounded p-1 text-[#1a2e1c] font-mono text-xs focus:outline-none focus:border-[#1a5c38]"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#4a6550] font-semibold">Est. Labor Costs:</span>
                    <input
                      type="number"
                      value={laborCost}
                      onChange={e => setLaborCost(Number(e.target.value))}
                      className="w-24 text-right bg-white border border-[#d1e4d5] rounded p-1 text-[#1a2e1c] font-mono text-xs focus:outline-none focus:border-[#1a5c38]"
                    />
                  </div>
                </div>

                <button
                  id="btn-recalculate-roi"
                  onClick={handleCalculateProfit}
                  className="w-full mt-2 py-2 bg-[#1a5c38] text-white hover:bg-[#134429] text-xs font-bold rounded-xl cursor-pointer shadow-sm"
                >
                  Recalculate ROI
                </button>
              </div>

              {/* Computes Output Card */}
              <div className="md:col-span-7 p-6 rounded-xl border border-green-200 bg-green-50/20 flex flex-col justify-between shadow-sm">
                {calcResult ? (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-[#1a5c38] tracking-wider uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> ROI Calculator outputs
                    </span>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Estimated Yield */}
                      <div className="p-3 bg-white border border-[#d1e4d5] rounded-lg text-center shadow-sm">
                        <p className="text-[10px] font-bold text-[#7a9a80] uppercase">Estimated Yield</p>
                        <p className="text-base font-bold text-[#1a2e1c] mt-0.5">{calcResult.yield} Tonnes</p>
                      </div>

                      {/* ROI */}
                      <div className="p-3 bg-white border border-[#d1e4d5] rounded-lg text-center shadow-sm">
                        <p className="text-[10px] font-bold text-[#7a9a80] uppercase flex items-center justify-center gap-1">Return On Capital</p>
                        <p className="text-base font-bold text-[#1a5c38] mt-0.5">{calcResult.roi}% ROI</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2 text-xs">
                      <div className="flex justify-between border-b border-[#e8f2e9] pb-1 text-[#4a6550]">
                        <span>Total Production Cost:</span>
                        <span className="font-bold text-[#1a2e1c]">₹{calcResult.cost}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#e8f2e9] pb-1 text-[#4a6550]">
                        <span>Projected Mandi Revenue:</span>
                        <span className="font-bold text-[#1a2e1c]">₹{calcResult.revenue}</span>
                      </div>
                      <div className="flex justify-between pb-1 text-[#1a5c38] font-bold text-sm">
                        <span>Expected Net Surplus:</span>
                        <span>₹{calcResult.profit}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded border border-green-200 bg-green-50 text-xs text-[#1a5c38] leading-normal flex gap-1.5 items-center">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      <span>{calcResult.rating} based on typical Karnataka APMC averages.</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-[#7a9a80]">Inputs matching. Recalculate above.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: SEASONAL SOWING CROP CALENDAR */}
        {panel === "calendar" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#1a5c38] tracking-wider uppercase">Schedules & Cycles</span>
              <h3 className="text-lg font-bold text-[#1a2e1c]">Regional State Seasonal Sowing Calendar</h3>
            </div>

            <div className="space-y-4">
              {seasonalCalendar.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[#d1e4d5] bg-[#f4f8f4] flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-[#1a5c38]/40 hover:bg-[#edf4ee] transition-all shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-[#7a9a80] uppercase tracking-widest">{item.season}</span>
                    <h4 className="text-base font-bold text-[#1a2e1c] mt-0.5">{item.crop}</h4>
                    <span className="text-xs text-[#1a5c38] font-bold mt-1 block">{item.optimalMonth}</span>
                  </div>

                  <div className="text-right text-xs space-y-1">
                    <p className="text-[#4a6550] bg-white border border-[#d1e4d5] px-2 py-1 rounded inline-block uppercase leading-none font-semibold">{item.waterDemand}</p>
                    <br />
                    <p className="text-[#1a5c38] bg-green-50 border border-green-200 px-2 py-1 rounded uppercase leading-none mt-1.5 inline-block font-bold">Yield potential: {item.yieldPotential}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
