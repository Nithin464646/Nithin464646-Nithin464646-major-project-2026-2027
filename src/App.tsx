import React, { useState, useEffect } from "react";
import { 
  Sprout, Award, BookOpen, Wrench, Bot, Bell, LogOut, MapPin, 
  Activity, Sparkles, Menu, X, Check, Heart, ChevronRight, Info, AlertTriangle, ShieldAlert, Search, TrendingUp
} from "lucide-react";
import { User, SmartAlert, Language } from "./types";

import WeatherWidget from "./components/WeatherWidget";
import AgriBot from "./components/AgriBot";
import MarketPriceDashboard from "./components/MarketPriceDashboard";
import GovSchemesPortal from "./components/GovSchemesPortal";
import GuidesHub from "./components/GuidesHub";
import AuthInterface from "./components/AuthInterface";
import AdminPanel from "./components/AdminPanel";
import AddonsTab from "./components/AddonsTab";
import FuturePricePredictor from "./components/FuturePricePredictor";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "market" | "predictor" | "schemes" | "education" | "addons" | "admin">("overview");
  
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [avgMarketPrice, setAvgMarketPrice] = useState("₹17,400");
  const [profitEstimate, setProfitEstimate] = useState("₹1,74,000");

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setActiveTab("overview");
    } catch (e) { console.error(e); }
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
    { tag: "overview", label: "Overview", icon: Activity },
    { tag: "market", label: "Crop Prices", icon: TrendingUp },
    { tag: "predictor", label: "AI Forecaster", icon: Sparkles },
    { tag: "schemes", label: "Schemes", icon: Award },
    { tag: "education", label: "Guides & Videos", icon: BookOpen },
    { tag: "addons", label: "Utilities", icon: Wrench },
    { tag: "admin", label: "Admin", icon: ShieldAlert },
  ];

  return (
    <div id="agriconnect-workspace-root" className="min-h-screen flex flex-col bg-[#f4f8f4] font-sans" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* ===== TOP HEADER ===== */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#d1e4d5] shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-[#1a5c38] rounded-xl flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[#1a5c38] font-bold text-lg leading-tight">Agri Connect</div>
              <div className="text-[#7a9a80] text-[10px] leading-none hidden sm:block">Empowering Farmers, Enriching Future</div>
            </div>
          </div>

          {/* Search bar – desktop */}
          <div className="hidden md:flex flex-1 max-w-md relative mx-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a9a80]" />
            <input
              type="text"
              placeholder="Search crops, prices, schemes, tips..."
              className="w-full pl-9 pr-4 py-2 bg-[#f4f8f4] border border-[#d1e4d5] rounded-lg text-sm text-[#1a2e1c] placeholder-[#7a9a80] focus:outline-none focus:border-[#1a5c38]"
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

            {/* User info + logout */}
            <div className="hidden lg:flex items-center gap-3 border-l border-[#d1e4d5] pl-3">
              <div className="w-8 h-8 rounded-full bg-[#1a5c38] flex items-center justify-center text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-[#1a2e1c]">{user.name}</p>
                <p className="text-[10px] text-[#7a9a80] uppercase tracking-wide">{user.category}</p>
              </div>
              <button
                id="btn-user-signout"
                onClick={handleLogout}
                className="w-8 h-8 flex items-center justify-center border border-[#d1e4d5] rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-[#7a9a80] transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
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

        {/* ===== HORIZONTAL NAV TABS ===== */}
        <div className="hidden md:block border-t border-[#e8f2e9] bg-[#1a5c38]">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.tag}
                onClick={() => setActiveTab(item.tag as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                  activeTab === item.tag
                    ? "border-white text-white bg-white/10"
                    : "border-transparent text-green-200 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
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
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 lg:px-8 py-6 overflow-y-auto">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">

            {/* Hero banner */}
            <div className="relative rounded-2xl overflow-hidden bg-[#1a5c38] min-h-52 flex items-center">
              {/* Left text */}
              <div className="relative z-10 p-8 max-w-lg">
                <p className="text-green-300 text-xs font-semibold uppercase tracking-wider mb-2">Your Trusted Agricultural Partner</p>
                <h2 className="text-3xl font-bold text-white leading-tight">
                  Welcome back,<br />{user.name}!
                </h2>
                <p className="text-green-200 text-sm mt-2 leading-relaxed">
                  Mandi price indexes in <span className="text-white font-semibold">{user.district}</span> remain high for {user.cropsGrown.join(", ") || "Tomato"}.
                </p>
                <button
                  onClick={() => setActiveTab("market")}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#1a5c38] text-sm font-bold rounded-xl hover:bg-green-50 transition-colors cursor-pointer"
                >
                  Learn More <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right decorative */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 md:w-2/5 opacity-20 pointer-events-none select-none flex items-center justify-center">
                <Sprout className="w-64 h-64 text-white" />
              </div>

              {/* Quick info cards */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
                <div className="bg-white rounded-xl p-4 shadow-md min-w-40">
                  <p className="text-[10px] text-[#7a9a80] uppercase font-semibold">Avg Mandi Rate</p>
                  <p className="text-xl font-bold text-[#1a5c38] mt-1">{avgMarketPrice}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md min-w-40">
                  <p className="text-[10px] text-[#7a9a80] uppercase font-semibold">Projected Surplus</p>
                  <p className="text-xl font-bold text-[#1a5c38] mt-1">{profitEstimate}</p>
                </div>
              </div>
            </div>

            {/* Quick cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Soil Health, Better Yield", desc: "Get your soil tested regularly and improve soil fertility.", cta: "Healthy Soil, Healthy Life", tab: "education" },
                { title: "PM-KISAN Scheme", desc: "Financial assistance of ₹6,000 per year to eligible farmers.", cta: "Check Eligibility", tab: "schemes" },
                { title: "Protect Crops, Increase Profit", desc: "Use quality seeds, balanced fertilizers and timely irrigation.", cta: "Good Practice, Good Profit", tab: "addons" },
                { title: "Weather Update", desc: "Stay updated with latest weather information for your region.", cta: "Check Weather", tab: "overview" },
              ].map((card, i) => (
                <div key={i} className="bg-white border border-[#d1e4d5] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-28 bg-gradient-to-br from-[#edf4ee] to-[#d1e4d5] flex items-center justify-center">
                    <Sprout className="w-16 h-16 text-[#1a5c38] opacity-30" />
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-bold text-[#1a2e1c] leading-tight">{card.title}</h4>
                    <p className="text-xs text-[#7a9a80] mt-1 leading-relaxed">{card.desc}</p>
                    <button
                      onClick={() => setActiveTab(card.tab as any)}
                      className="mt-3 w-full py-1.5 bg-[#1a5c38] text-white text-xs font-semibold rounded-lg hover:bg-[#134429] transition-colors cursor-pointer"
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
              <div className="bg-white border border-[#d1e4d5] rounded-xl p-5">
                <h4 className="text-sm font-bold text-[#1a2e1c] mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#1a5c38]" /> Watchlisted Crop Alerts
                </h4>
                <div className="space-y-3">
                  {user.watchlistCrops && user.watchlistCrops.length > 0 ? (
                    user.watchlistCrops.map(crop => (
                      <div key={crop} className="flex justify-between items-center p-3 rounded-lg border border-[#e8f2e9] bg-[#f4f8f4] hover:border-[#1a5c38]/30 transition-all">
                        <div>
                          <span className="text-sm font-semibold text-[#1a2e1c]">{crop}</span>
                          <span className="text-[10px] text-[#7a9a80] block uppercase tracking-wide">Trend: UP</span>
                        </div>
                        <button
                          onClick={() => setActiveTab("market")}
                          className="px-3 py-1 text-xs font-semibold bg-[#edf4ee] text-[#1a5c38] border border-[#d1e4d5] rounded-lg hover:bg-[#1a5c38] hover:text-white transition-colors cursor-pointer"
                        >
                          Analyze →
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-[#7a9a80] text-xs">
                      No crops in watchlist. Go to market forecast and click "Star" to add favorites.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-[#d1e4d5] rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-[#1a5c38] tracking-wider uppercase">Farming Advisor</span>
                  <h4 className="text-sm font-bold text-[#1a2e1c] mt-1 mb-2">AI Pest Diagnostic Tool</h4>
                  <p className="text-xs text-[#7a9a80] leading-relaxed">
                    Instant entomology advice. Select disease triggers or describe leaf spotting patterns.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("addons")}
                  className="mt-4 py-2 px-4 bg-[#1a5c38] text-white font-bold text-sm rounded-xl cursor-pointer hover:bg-[#134429] transition-colors"
                >
                  Scan Disease Now
                </button>
              </div>
            </div>

          </div>
        )}

        {activeTab === "market" && (
          <MarketPriceDashboard userProfile={user} onUpdateProfile={(updated) => setUser(updated)} />
        )}
        {activeTab === "predictor" && <FuturePricePredictor userProfile={user} />}
        {activeTab === "schemes" && <GovSchemesPortal userProfile={user} />}
        {activeTab === "education" && <GuidesHub />}
        {activeTab === "addons" && (
          <AddonsTab userProfile={user} onUpdateProfile={(updated) => setUser(updated)} />
        )}
        {activeTab === "admin" && <AdminPanel />}

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
          className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1a5c38] hover:bg-[#134429] text-white shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all z-40 font-semibold text-sm"
          title="Open AgriBot Smart Chat"
        >
          <Bot className="w-5 h-5" />
          Ask AgriBot
        </button>
      )}
    </div>
  );
}
