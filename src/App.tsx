import React, { useState, useEffect } from "react";
import { 
  Sprout, Award, BookOpen, Wrench, Bot, Bell, LogOut, MapPin, 
  Activity, Sparkles, Menu, X, Check, Heart, ChevronRight, Info, AlertTriangle, ShieldAlert, Search, TrendingUp, Languages
} from "lucide-react";
import { User, SmartAlert, Language } from "./types";
import { getTranslation } from "./utils/translations";

import WeatherWidget from "./components/WeatherWidget";
import AgriBot from "./components/AgriBot";
import MarketPriceDashboard from "./components/MarketPriceDashboard";
import GovSchemesPortal from "./components/GovSchemesPortal";
import GuidesHub from "./components/GuidesHub";
import AuthInterface from "./components/AuthInterface";
import AddonsTab from "./components/AddonsTab";
import FuturePricePredictor from "./components/FuturePricePredictor";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "market" | "predictor" | "schemes" | "education" | "addons">("overview");
  
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [avgMarketPrice, setAvgMarketPrice] = useState("₹17,400");
  const [profitEstimate, setProfitEstimate] = useState("₹1,74,000");
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const LANGUAGE_OPTIONS = [
    { code: Language.ENGLISH, label: "English",  native: "English",  flag: "🇬🇧" },
    { code: Language.KANNADA, label: "Kannada",   native: "ಕನ್ನಡ",    flag: "🇮🇳" },
    { code: Language.HINDI,   label: "Hindi",     native: "हिन्दी",   flag: "🇮🇳" },
    { code: Language.TELUGU,  label: "Telugu",    native: "తెలుగు",   flag: "🇮🇳" },
    { code: Language.TAMIL,   label: "Tamil",     native: "தமிழ்",    flag: "🇮🇳" },
  ];

  const t = (key: string) => getTranslation(language, key);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setShowLangMenu(false);

    const langMap: Record<string, string> = {
      [Language.ENGLISH]: "en",
      [Language.KANNADA]: "kn",
      [Language.HINDI]: "hi",
      [Language.TELUGU]: "te",
      [Language.TAMIL]: "ta",
    };

    const targetLang = langMap[langCode] || "en";

    // Set Google Translate cookies for instantaneous full-page DOM translation
    document.cookie = `googtrans=/en/${targetLang}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=/en/${targetLang}; path=/`;
    document.cookie = `googtrans=/auto/${targetLang}; path=/`;

    // Trigger Google Translate iframe combo element if ready
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (combo) {
      combo.value = targetLang;
      combo.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const loadAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(data);
      setUnreadCount(data.filter((a: SmartAlert) => !a.read).length);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/profile");
        const data = await res.json();
        if (data.authenticated) setUser(data.user);
      } catch (e) { console.warn("Session check offline"); }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (user) {
      loadAlerts();
      const t = setInterval(loadAlerts, 15000);
      return () => clearInterval(t);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/alerts/readAll", { method: "POST" });
      loadAlerts();
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab("overview");
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "danger": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "success": return <Check className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f4f8f4] flex items-center justify-center">
        <AuthInterface onAuthSuccess={(usr) => setUser(usr)} />
      </div>
    );
  }

  const navItems = [
    { tag: "overview",  label: t("overview"),  icon: Activity },
    { tag: "market",    label: t("market"),    icon: TrendingUp },
    { tag: "predictor", label: t("predictor"), icon: Sparkles },
    { tag: "schemes",   label: t("schemes"),   icon: Award },
    { tag: "education", label: t("education"), icon: BookOpen },
    { tag: "addons",    label: t("addons"),    icon: Wrench },
  ];

  return (
    <div id="agriconnect-workspace-root" className="min-h-screen flex flex-col bg-[#f0f6f1] font-sans" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* ===== TOP HEADER ===== */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#d1e4d5] shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-[#166534] to-[#14532d] rounded-xl flex items-center justify-center shadow-md shadow-green-900/20">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[#166534] font-extrabold text-lg leading-tight tracking-tight">Agri Connect</div>
              <div className="text-[#7a9a80] text-[10px] leading-none hidden sm:block">Empowering Farmers, Enriching Future</div>
            </div>
          </div>

          {/* Search bar – desktop */}
          <div className="hidden md:flex flex-1 max-w-md relative mx-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a9a80]" />
            <input
              type="text"
              placeholder="Search crops, prices, schemes, tips..."
              className="w-full pl-9 pr-4 py-2 bg-[#f0f6f1] border-1.5 border-[#d1e4d5] rounded-full text-sm text-[#1a2e1c] placeholder-[#7a9a80] focus:outline-none focus:border-[#166534] transition-colors"
            />
          </div>

          {/* Right toolbar */}
          <div className="flex items-center gap-3">
            {/* Location */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#edf4ee] border border-[#d1e4d5] rounded-full text-xs text-[#4a6550]">
              <MapPin className="w-3.5 h-3.5 text-[#1a5c38]" />
              <span>{user.village}, {user.district}</span>
            </div>

            {/* Alerts */}
            <div className="relative">
              <button
                id="btn-alerts-bell"
                onClick={() => setShowAlertMenu(!showAlertMenu)}
                className="relative w-9 h-9 flex items-center justify-center border border-[#d1e4d5] rounded-lg hover:bg-[#edf4ee] text-[#4a6550] transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>

              {showAlertMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#d1e4d5] rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-[#e8f2e9] flex justify-between items-center bg-[#f4f8f4]">
                    <span className="text-xs font-semibold text-[#1a2e1c]">Smart Notifications</span>
                    <button onClick={handleMarkAllRead} className="text-xs text-[#1a5c38] hover:underline cursor-pointer">Clear All</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#e8f2e9]">
                    {alerts.length === 0 ? (
                      <div className="p-6 text-center text-[#7a9a80] text-xs">No active alerts today.</div>
                    ) : (
                      alerts.map((al) => (
                        <div key={al.id} className={`p-3 text-xs flex gap-2.5 items-start ${al.read ? "opacity-60" : "bg-green-50"}`}>
                          <div className="mt-0.5">{getAlertIcon(al.type)}</div>
                          <div className="flex-1">
                            <p className="font-semibold text-[#1a2e1c]">{al.title}</p>
                            <p className="text-[#4a6550] text-[11px] leading-relaxed">{al.message}</p>
                            <span className="text-[10px] text-[#7a9a80] font-mono block pt-1">
                              {new Date(al.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User info + language + logout — always visible */}
            <div className="flex items-center gap-2 border-l border-[#d1e4d5] pl-3">
              {/* Avatar + name (desktop only) */}
              <div className="hidden lg:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1a5c38] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-right hidden xl:block">
                  <p className="text-xs font-semibold text-[#1a2e1c]">{user.name}</p>
                  <p className="text-[10px] text-[#7a9a80] uppercase tracking-wide">{user.category}</p>
                </div>
              </div>

              {/* Language selector */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowLangMenu(prev => !prev)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#d1e4d5] rounded-lg hover:bg-[#edf4ee] text-[#4a6550] text-xs font-semibold transition-all cursor-pointer"
                  title={t("language")}
                >
                  <Languages className="w-3.5 h-3.5 text-[#1a5c38]" />
                  <span>{LANGUAGE_OPTIONS.find(l => l.code === language)?.flag}</span>
                </button>

                {showLangMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white border border-[#d1e4d5] rounded-xl shadow-2xl z-50 overflow-hidden" style={{minWidth: "190px"}}>
                      <p className="text-[10px] font-bold text-[#7a9a80] uppercase tracking-widest px-4 py-2 border-b border-[#e8f2e9]">
                        Select Language
                      </p>
                      {LANGUAGE_OPTIONS.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors cursor-pointer
                            ${language === lang.code
                              ? "bg-[#edf4ee] text-[#166534] font-bold"
                              : "text-[#4a6550] hover:bg-[#f4f8f4]"
                            }`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <div className="flex-1">
                            <span className="block text-sm font-semibold">{lang.native}</span>
                            <span className="text-[11px] text-[#7a9a80]">{lang.label}</span>
                          </div>
                          {language === lang.code && <Check className="w-3.5 h-3.5 text-[#1a5c38]" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Logout — always visible */}
              <button
                id="btn-user-signout"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 text-red-600 text-xs font-semibold transition-all cursor-pointer flex-shrink-0"
                title={t("logout")}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("logout")}</span>
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="md:hidden w-9 h-9 flex items-center justify-center border border-[#d1e4d5] rounded-lg hover:bg-[#edf4ee] text-[#4a6550] cursor-pointer"
            >
              {showMobileNav ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ===== HORIZONTAL NAV TABS (DESKTOP) ===== */}
        <div className="hidden md:block border-t border-[#166534]/30 bg-gradient-to-r from-[#14532d] to-[#166534]">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.tag}
                onClick={() => setActiveTab(item.tag as any)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 rounded-t-lg ${
                  activeTab === item.tag
                    ? "border-white text-white bg-white/15 shadow-inner"
                    : "border-transparent text-green-200/90 hover:text-white hover:bg-white/8"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== MOBILE HORIZONTAL SCROLLING PILL TABS ===== */}
        <div className="md:hidden bg-[#14532d] px-3 py-2 border-t border-green-800/40 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {navItems.map((item) => (
              <button
                key={item.tag}
                onClick={() => setActiveTab(item.tag as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === item.tag
                    ? "bg-white text-[#14532d] font-extrabold shadow-sm"
                    : "text-green-100 hover:bg-white/10"
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {showMobileNav && (
        <div className="md:hidden bg-white border-b border-[#d1e4d5] shadow-lg z-30 px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.tag}
              onClick={() => { setActiveTab(item.tag as any); setShowMobileNav(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === item.tag
                  ? "bg-[#1a5c38] text-white"
                  : "text-[#4a6550] hover:bg-[#edf4ee]"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}

          {/* Mobile logout */}
          <div className="pt-2 mt-2 border-t border-[#d1e4d5]">
            <div className="flex items-center gap-2.5 px-4 py-2">
              <div className="w-7 h-7 rounded-full bg-[#1a5c38] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1a2e1c] truncate">{user.name}</p>
                <p className="text-[10px] text-[#7a9a80]">{user.category}</p>
              </div>
            </div>
            <button
              onClick={() => { handleLogout(); setShowMobileNav(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 lg:px-8 py-6 overflow-y-auto">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">

            {/* Hero banner */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#14532d] via-[#166534] to-[#15803d] min-h-56 flex items-center">
              {/* Grid overlay pattern */}
              <div className="absolute inset-0 hero-grid-pattern" />

              {/* Left text */}
              <div className="relative z-10 p-8 max-w-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-agri-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  <p className="text-green-300 text-xs font-semibold uppercase tracking-wider">Your Trusted Agricultural Partner</p>
                </div>
                <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
                  Welcome back,<br /><span className="text-green-300">{user.name}!</span>
                </h2>
                <p className="text-green-200/90 text-sm mt-3 leading-relaxed max-w-sm">
                  Mandi price indexes in <span className="text-white font-bold">{user.district}</span> remain high for {user.cropsGrown.join(", ") || "Tomato"}.
                </p>
                <button
                  onClick={() => setActiveTab("market")}
                  className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#166534] text-sm font-bold rounded-full hover:bg-green-50 transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95"
                >
                  View Mandi Prices <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right decorative */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 md:w-2/5 opacity-10 pointer-events-none select-none flex items-center justify-center">
                <Sprout className="w-72 h-72 text-white" />
              </div>

              {/* Quick info cards — floating */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl min-w-44 border border-white/20">
                  <p className="text-[10px] text-[#7a9a80] uppercase font-bold tracking-widest">Avg Mandi Rate</p>
                  <p className="text-2xl font-extrabold text-[#166534] mt-1">{avgMarketPrice}</p>
                  <p className="text-[10px] text-green-600 font-semibold mt-0.5">↑ Active today</p>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl min-w-44 border border-white/20">
                  <p className="text-[10px] text-[#7a9a80] uppercase font-bold tracking-widest">Projected Surplus</p>
                  <p className="text-2xl font-extrabold text-[#166534] mt-1">{profitEstimate}</p>
                  <p className="text-[10px] text-blue-500 font-semibold mt-0.5">Estimated gross</p>
                </div>
              </div>
            </div>

            {/* Quick cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Soil Health, Better Yield", desc: "Get your soil tested regularly and improve soil fertility.", cta: "Healthy Soil, Healthy Life", tab: "education", bg: "from-amber-400 to-orange-400", img: "🌱" },
                { title: "PM-KISAN Scheme", desc: "Financial assistance of ₹6,000 per year to eligible farmers.", cta: "Check Eligibility", tab: "schemes", bg: "from-[#166534] to-[#15803d]", img: "👨‍🌾" },
                { title: "Protect Crops, Profit", desc: "Use quality seeds, balanced fertilizers and timely irrigation.", cta: "Good Practice, Good Profit", tab: "addons", bg: "from-emerald-500 to-teal-500", img: "🌾" },
                { title: "Weather Update", desc: "Stay updated with latest weather information for your region.", cta: "Check Weather", tab: "overview", bg: "from-sky-400 to-blue-500", img: "⛅" },
              ].map((card, i) => (
                <div key={i} className="bg-white border border-[#d1e4d5] rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group agri-card-lift"
                  onClick={() => setActiveTab(card.tab as any)}>
                  <div className={`h-32 bg-gradient-to-br ${card.bg} flex items-center justify-center relative`}>
                    <span className="text-6xl group-hover:scale-110 transition-transform notranslate" translate="no">{card.img}</span>
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-bold text-[#1a2e1c] leading-tight">{card.title}</h4>
                    <p className="text-xs text-[#7a9a80] mt-1 leading-relaxed">{card.desc}</p>
                    <button
                      onClick={e => { e.stopPropagation(); setActiveTab(card.tab as any); }}
                      className="mt-3 w-full py-2 bg-[#166534] text-white text-xs font-bold rounded-full hover:bg-[#14532d] transition-colors cursor-pointer shadow-sm"
                    >
                      {card.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Weather Widget */}
            <WeatherWidget currentDistrict={user.district} />

            {/* Watchlist + AI Pest Tool */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#d1e4d5] rounded-2xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-[#1a2e1c] mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#166534]" /> Watchlisted Crop Alerts
                </h4>
                <div className="space-y-3">
                  {user.watchlistCrops && user.watchlistCrops.length > 0 ? (
                    user.watchlistCrops.map(crop => (
                      <div key={crop} className="flex justify-between items-center p-3 rounded-xl border border-[#e8f2e9] bg-[#f0f6f1] hover:border-[#166534]/30 hover:bg-white transition-all">
                        <div>
                          <span className="text-sm font-semibold text-[#1a2e1c]">{crop}</span>
                          <span className="text-[10px] text-green-600 font-semibold block">↑ Trend: UP</span>
                        </div>
                        <button
                          onClick={() => setActiveTab("market")}
                          className="px-3 py-1.5 text-xs font-bold bg-[#166534] text-white rounded-full hover:bg-[#14532d] transition-colors cursor-pointer"
                        >
                          Analyze →
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#7a9a80] text-xs">
                      <Heart className="w-8 h-8 text-[#d1e4d5] mx-auto mb-2" />
                      No crops in watchlist. Go to market prices and click the ⭐ star to add favorites.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#14532d] to-[#166534] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-green-300 tracking-widest uppercase">AI Farming Advisor</span>
                  <h4 className="text-lg font-extrabold text-white mt-1 mb-2 leading-tight">AI Pest Diagnostic Tool</h4>
                  <p className="text-sm text-green-200/80 leading-relaxed">
                    Instant entomology advice. Describe leaf spotting patterns or upload a photo.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("addons")}
                  className="mt-5 py-2.5 px-5 bg-white text-[#166534] font-bold text-sm rounded-full cursor-pointer hover:bg-green-50 transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  🔬 Scan Disease Now
                </button>
              </div>
            </div>

          </div>
        )}

        {activeTab === "market" && (
          <MarketPriceDashboard currentLanguage={language} userProfile={user} onUpdateProfile={(updated) => setUser(updated)} />
        )}
        {activeTab === "predictor" && <FuturePricePredictor currentLanguage={language} userProfile={user} />}
        {activeTab === "schemes" && <GovSchemesPortal currentLanguage={language} userProfile={user} />}
        {activeTab === "education" && <GuidesHub currentLanguage={language} />}
        {activeTab === "addons" && (
          <AddonsTab currentLanguage={language} userProfile={user} onUpdateProfile={(updated) => setUser(updated)} />
        )}

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-[#d1e4d5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7a9a80] gap-4">
          <div className="flex gap-6 uppercase font-semibold tracking-widest text-[10px]">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#1a5c38] rounded-full animate-agri-pulse"></span>
              Node: BLR-INTELL-01
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              Sync: Optimal (24ms)
            </span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-[#1a5c38] cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-[#1a5c38] cursor-pointer transition-colors">API Docs</span>
            <span className="text-[#1a5c38] font-semibold">© 2026 AgriConnect AI</span>
          </div>
        </footer>
      </main>

      {/* AgriBot Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 transform transition-transform duration-300 ease-out flex ${showChat ? "translate-x-0" : "translate-x-full"}`}>
        {showChat && (
          <div
            onClick={() => setShowChat(false)}
            className="fixed inset-0 bg-black/20 -translate-x-full w-screen h-screen cursor-pointer"
          />
        )}
        <div className="w-full h-full relative">
          <AgriBot onClose={() => setShowChat(false)} userProfile={user} />
        </div>
      </div>

      {/* Floating AgriBot button */}
      {!showChat && (
        <button
          id="btn-trigger-agribot"
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#14532d] to-[#166534] hover:from-[#166534] hover:to-[#15803d] text-white shadow-2xl shadow-green-900/40 cursor-pointer hover:scale-110 active:scale-95 transition-all z-40 font-bold text-sm border border-green-700/30"
          title="Open AgriBot Smart Chat"
        >
          <Bot className="w-5 h-5" />
          Ask AgriBot
        </button>
      )}
    </div>
  );
}
