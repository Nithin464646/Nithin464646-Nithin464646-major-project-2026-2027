import React, { useState, useEffect } from "react";
import { 
  Search, Filter, Star, Download, 
  Info, CheckCircle2, MapPin, Sprout,
  X, TrendingUp, TrendingDown, Minus, BarChart2, Calendar, Building2
} from "lucide-react";
import { MarketPrice, User, Language } from "../types";
import { getTranslation } from "../utils/translations";
import { FOCUS_DISTRICTS, DISTRICT_MARKETS } from "../data/marketData";

// ── Calculate Crop Value Widget ──────────────────────────────────────────────
function CalculateCropValue({ prices, selectedRow, currentLanguage = Language.ENGLISH }: { prices: MarketPrice[]; selectedRow: MarketPrice | null; currentLanguage?: Language }) {
  const t = (key: string) => getTranslation(currentLanguage, key);
  const uniqueCrops = Array.from(new Set(prices.map(p => p.cropName))).sort();
  const [calcCrop, setCalcCrop] = useState(selectedRow?.cropName || "Paddy (Rice)");
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState<"Kg" | "Quintal">("Kg");

  // Update selected crop when user clicks a card
  useEffect(() => {
    if (selectedRow) setCalcCrop(selectedRow.cropName);
  }, [selectedRow]);

  // Get modal price for selected crop (average across all markets)
  const cropPrices = prices.filter(p => p.cropName === calcCrop);
  const avgModalPerQtl = cropPrices.length
    ? Math.round(cropPrices.reduce((s, p) => s + p.modalPrice, 0) / cropPrices.length)
    : 2000;
  
  const pricePerKg = avgModalPerQtl / 100;
  const totalKg = unit === "Quintal" ? quantity * 100 : quantity;
  const totalValue = Math.round(totalKg * pricePerKg);

  return (
    <div id="harvest-value-calculator" className="bg-white border border-[#d1e4d5] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#e8f2e9] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#edf4ee] flex items-center justify-center text-[#166534] notranslate" translate="no">🧮</div>
          <div>
            <h4 className="text-sm font-bold text-[#1a2e1c]">{t("calculateValue")}</h4>
            <p className="text-[11px] text-[#7a9a80]">{t("selectCropToCalc")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-3">
          <label className="text-xs font-semibold text-[#4a6550] block mb-1">{t("cropName")}</label>
          <select value={calcCrop} onChange={e => setCalcCrop(e.target.value)}
            className="w-full bg-[#f4f8f4] border border-[#d1e4d5] rounded-lg px-3 py-2 text-sm text-[#1a2e1c]">
            {uniqueCrops.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-[#4a6550] block mb-1">{t("quantity")}</label>
          <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-full bg-[#f4f8f4] border border-[#d1e4d5] rounded-lg px-3 py-2 text-sm text-[#1a2e1c]" />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#4a6550] block mb-1">{t("unit")}</label>
          <select value={unit} onChange={e => setUnit(e.target.value as any)}
            className="w-full bg-[#f4f8f4] border border-[#d1e4d5] rounded-lg px-3 py-2 text-sm text-[#1a2e1c]">
            <option value="Kg">Kg</option>
            <option value="Quintal">Quintal</option>
          </select>
        </div>
      </div>

      <div className="bg-[#edf4ee] border border-[#d1e4d5] rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-[#7a9a80] font-medium">{t("totalValue")}</p>
          <p className="text-2xl font-extrabold text-[#166534]">₹{totalValue.toLocaleString("en-IN")}</p>
        </div>
        <div className="text-right text-[11px] text-[#7a9a80]">
          <p>₹{avgModalPerQtl}/Quintal</p>
          <p>₹{pricePerKg.toFixed(1)}/Kg</p>
        </div>
      </div>

      <p className="text-[10px] text-[#7a9a80] text-center">
        {calcCrop} Price = ₹{pricePerKg.toFixed(1)}/Kg &nbsp;|&nbsp; Quantity = {quantity} {unit} &nbsp;|&nbsp; Total = ₹{totalValue.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

interface MarketPriceDashboardProps {
  userProfile: User | null;
  onUpdateProfile: (updated: User) => void;
  currentLanguage?: Language;
}

export default function MarketPriceDashboard({ userProfile, onUpdateProfile, currentLanguage = Language.ENGLISH }: MarketPriceDashboardProps) {
  const t = (key: string) => getTranslation(currentLanguage, key);
  
  // Price states
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [market, setMarket] = useState("");
  const [category, setCategory] = useState("");
  
  // Selection for comparison / detail
  const [selectedRow, setSelectedRow] = useState<MarketPrice | null>(null);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [detailCrop, setDetailCrop] = useState<MarketPrice | null>(null);
  
  // Statuses
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Load prices initially
  const loadPrices = async () => {
    setLoadingPrices(true);
    try {
      let url = "/api/prices";
      const params = [];
      if (district) params.push(`district=${encodeURIComponent(district)}`);
      if (category) params.push(`category=${encodeURIComponent(category)}`);
      if (params.length) url += `?${params.join("&")}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setPrices(data);

      // Auto-select first row if nothing selected
      if (data.length && !selectedRow) {
        handleRowSelect(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrices(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, [district, category]);

  // Handle detailed analysis + ML loading on row click
  const handleRowSelect = async (row: MarketPrice) => {
    setSelectedRow(row);
    setLoadingHistory(true);

    try {
      // Fetch 14-days historical curves
      const histRes = await fetch(`/api/prices/historical?cropName=${encodeURIComponent(row.cropName)}&market=${encodeURIComponent(row.market)}`);
      const hist = await histRes.json();
      setHistoricalData(hist);
    } catch (e) {
      console.error("Failed to load detailed analytics", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Toggle watchlist stars
  const toggleWatchlist = (crop: string) => {
    if (!userProfile) return;
    const currentList = [...(userProfile.watchlistCrops || [])];
    const index = currentList.indexOf(crop);
    
    if (index === -1) {
      currentList.push(crop);
    } else {
      currentList.splice(index, 1);
    }

    const updatedUser = { ...userProfile, watchlistCrops: currentList };
    saveProfileUpdate(updatedUser);
  };

  // Toggle favorite APMCs
  const toggleFavMarket = (mkt: string) => {
    if (!userProfile) return;
    const currentList = [...(userProfile.favoriteMarkets || [])];
    const index = currentList.indexOf(mkt);

    if (index === -1) {
      currentList.push(mkt);
    } else {
      currentList.splice(index, 1);
    }

    const updatedUser = { ...userProfile, favoriteMarkets: currentList };
    saveProfileUpdate(updatedUser);
  };

  const saveProfileUpdate = async (updated: User) => {
    try {
      const res = await fetch("/api/auth/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        onUpdateProfile(data.user);
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Download Crops Price Report as plain clean text CSV representation
  const handleDownloadReport = () => {
    setDownloading(true);
    setTimeout(() => {
      const filtered = prices.filter(p => p.cropName.toLowerCase().includes(search.toLowerCase()));
      let content = "AGRICONNECT - OFFICIAL MARKET PRICES REPORT\n";
      content += `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
      content += "=========================================================================\n\n";
      content += "Crop Name,Market,District,Min Price (₹/Qtl),Max Price (₹/Qtl),Modal Price (₹/Qtl)\n";

      filtered.forEach(p => {
        content += `${p.cropName},${p.market},${p.district},${p.minPrice},${p.maxPrice},${p.modalPrice}\n`;
      });

      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `agriconnect_mandi_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(false);
    }, 1500);
  };

  // Filter prices list dynamically by text search
  const displayedPrices = prices.filter(p => {
    const matchesSearch = p.cropName.toLowerCase().includes(search.toLowerCase()) || 
                          p.market.toLowerCase().includes(search.toLowerCase());
    const matchesMarket = market ? p.market === market : true;
    return matchesSearch && matchesMarket;
  });

  const getCropImage = (cropName: string): string => {
    const map: Record<string, string> = {
      // Vegetables
      "Tomato":                  "/crop_images/Vegetables/Tomato.jpeg",
      "Onion":                   "/crop_images/Vegetables/Onion.jpeg",
      "Potato":                  "/crop_images/Vegetables/Potato.jpeg",
      "Carrot":                  "/crop_images/Vegetables/Carrot.jpeg",
      "Green Chilli":            "/crop_images/Vegetables/Green Chilli.jpeg",
      "Cabbage":                 "/crop_images/Vegetables/Cabbage.jpeg",
      "Cauliflower":             "/crop_images/Vegetables/Cauliflower.jpeg",
      "Brinjal (Eggplant)":      "/crop_images/Vegetables/Brinjal (Eggplant).jpeg",
      "Beans (French)":          "/crop_images/Vegetables/Beans (French).jpeg",
      "Bitter Gourd":            "/crop_images/Vegetables/Bitter Gourd.jpeg",
      "Bottle Gourd":            "/crop_images/Vegetables/Bottle Gourd.jpeg",
      "Ridge Gourd":             "/crop_images/Vegetables/Ridge Gourd.jpeg",
      "Snake Gourd":             "/crop_images/Vegetables/Snake Gourd.jpeg",
      "Lady Finger (Okra)":      "/crop_images/Vegetables/Lady Finger (Okra).jpeg",
      "Capsicum":                "/crop_images/Vegetables/Capsicum.jpeg",
      "Beetroot":                "/crop_images/Vegetables/Beetroot.jpeg",
      "Radish":                  "/crop_images/Vegetables/Radish.jpeg",
      "Spinach":                 "/crop_images/Vegetables/Spinach.jpeg",
      "Coriander (Leaves)":      "/crop_images/Vegetables/Coriander (Leaves).jpeg",
      "Fenugreek (Leaves)":      "/crop_images/Vegetables/Fenugreek (Leaves).jpeg",
      "Drumstick (Moringa)":     "/crop_images/Vegetables/Drumstick (Moringa).jpeg",
      "Raw Banana":              "/crop_images/Vegetables/Raw Banana.jpeg",
      "Cluster Beans (Guar)":    "/crop_images/Vegetables/Cluster Beans (Guar).jpeg",
      "Pumpkin":                 "/crop_images/Vegetables/Pumpkin.jpeg",
      "Sweet Potato":            "/crop_images/Vegetables/Sweet Potato.jpg",
      "Taro (Arbi)":             "/crop_images/Vegetables/Taro (Arbi).jpg",
      // Fruits
      "Mango (Alphonso)":        "/crop_images/Fruits/Mango (Alphonso).jpeg",
      "Banana (Yelakki)":        "/crop_images/Fruits/Banana (Yelakki).jpeg",
      "Papaya":                  "/crop_images/Fruits/Papaya.jpeg",
      "Grapes (Bangalore Blue)": "/crop_images/Fruits/Grapes (Bangalore Blue).jpeg",
      "Pomegranate":             "/crop_images/Fruits/Pomegranate.jpeg",
      "Sapota (Chikoo)":         "/crop_images/Fruits/Sapota (Chikoo).jpeg",
      "Guava":                   "/crop_images/Fruits/Guava.jpeg",
      "Watermelon":              "/crop_images/Fruits/Watermelon.jpeg",
      "Muskmelon":               "/crop_images/Fruits/Muskmelon.webp",
      "Pineapple":               "/crop_images/Fruits/Pineapple.jpeg",
      "Coconut":                 "/crop_images/Fruits/Coconut.jpeg",
      "Jackfruit":               "/crop_images/Fruits/Jackfruit.jpeg",
      "Lemon":                   "/crop_images/Fruits/Lemon.jpeg",
      "Orange (Nagpur)":         "/crop_images/Fruits/Orange (Nagpur).jpeg",
      "Apple":                   "/crop_images/Fruits/Apple.jpeg",
      // Cereals
      "Paddy (Rice)":            "/crop_images/Cereals/Paddy (Rice).jpeg",
      "Ragi (Finger Millet)":    "/crop_images/Cereals/Ragi (Finger Millet).jpeg",
      "Maize (Corn)":            "/crop_images/Cereals/Maize (Corn).jpeg",
      "Jowar (Sorghum)":         "/crop_images/Pulses/Jowar (Sorghum).jpeg",
      "Bajra (Pearl Millet)":    "/crop_images/Cereals/Bajra (Pearl Millet).jpeg",
      "Wheat":                   "/crop_images/Cereals/Wheat.jpeg",
      "Barley":                  "/crop_images/Cereals/Barley.jpeg",
      "Foxtail Millet (Navane)": "/crop_images/Cereals/Foxtail Millet (Navane).jpeg",
      // Pulses
      "Tur / Arhar Dal":         "/crop_images/Pulses/Tur _Arhar Dal.jpeg",
      "Bengal Gram (Chana Dal)": "/crop_images/Pulses/Bengal Gram (Chana Dal).jpeg",
      "Green Gram (Moong)":      "/crop_images/Pulses/Green Gram (Moong).jpeg",
      "Black Gram (Urad)":       "/crop_images/Pulses/Black Gram (Urad).jpeg",
      "Lentil (Masoor)":         "/crop_images/Pulses/Lentil (Masoor).jpeg",
      "Field Peas (Vatana)":     "/crop_images/Pulses/Field Peas (Vatana).jpeg",
      "Cowpea (Lobia)":          "/crop_images/Cereals/Cowpea (Lobia).jpeg",
      // Spices
      "Garlic":                  "/crop_images/Spices/Garlic.jpeg",
      "Ginger":                  "/crop_images/Spices/Ginger.jpeg",
      "Turmeric":                "/crop_images/Spices/Turmeric.jpeg",
      "Coriander Seeds":         "/crop_images/Spices/Coriander Seeds.jpeg",
      "Cumin (Jeera)":           "/crop_images/Spices/Cumin (Jeera).jpeg",
      "Black Pepper":            "/crop_images/Spices/Black Pepper.jpeg",
      "Cardamom":                "/crop_images/Spices/Cardamom.jpeg",
      "Dry Red Chilli":          "/crop_images/Spices/Dry Red Chilli.jpeg",
      "Fenugreek Seeds":         "/crop_images/Spices/Fenugreek Seeds.jpeg",
      // Oilseeds
      "Groundnut":               "/crop_images/Oilseeds/Groundnut.jpeg",
      "Sunflower":               "/crop_images/Oilseeds/Sunflower.jpeg",
      "Sesame (Til)":            "/crop_images/Oilseeds/Sesame (Til).jpeg",
      "Soybean":                 "/crop_images/Oilseeds/Soybean.jpeg",
      "Mustard (Rapeseed)":      "/crop_images/Oilseeds/Mustard (Rapeseed).jpeg",
      "Castor":                  "/crop_images/Oilseeds/Castor.jpeg",
    };
    return map[cropName] || "/crop_images/Vegetables/Tomato.jpeg";
  };  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case "SELL_NOW":
        return { text: "Sell immediately", color: "bg-red-500/20 text-red-400 border-red-500/30", badge: "🔴" };
      case "SELL_LATER":
        return { text: "Sell later", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", badge: "🟢" };
      default:
        return { text: "Hold crops", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", badge: "🟡" };
    }
  };

  return (
    <div id="market-panel-root" className="space-y-6 pb-12">
      <div className="price-ticker rounded-xl mb-5 px-4">
        <div className="ticker-track flex items-center gap-8">
          {/* Repeat the prices array twice for seamless loop */}
          {[...prices.slice(0,8), ...prices.slice(0,8)].map((p, i) => (
            <span key={i} className="flex items-center gap-2 text-xs font-semibold flex-shrink-0 py-1">
              <span className="text-green-200">{p.cropName}</span>
              <span className="text-white font-bold">\u20b9{p.modalPrice.toLocaleString('en-IN')}</span>
              {p.modalPrice > p.minPrice 
                ? <span className="text-green-300">\u25b2</span>
                : <span className="text-red-300">\u25bc</span>
              }
            </span>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-[#d1e4d5] rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-[#1a5c38]" />
          <h3 className="text-base font-bold text-[#1a2e1c]">Search & Filter</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a9a80]" />
            <input id="crop-text-search" type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Crop Name"
              className="w-full pl-9 pr-4 py-2.5 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#4a6550] block mb-1">State</label>
            <select className="w-full px-3 py-2 border border-[#d1e4d5] rounded-xl text-sm focus:outline-none focus:border-[#1a5c38] bg-white">
              <option>Karnataka</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#4a6550] block mb-1">District</label>
            <select id="search-filter-district" value={district} onChange={(e) => { setDistrict(e.target.value); setMarket(""); }}
              className="w-full px-3 py-2 border border-[#d1e4d5] rounded-xl text-sm focus:outline-none focus:border-[#1a5c38] bg-white">
              <option value="">All Districts</option>
              {FOCUS_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#4a6550] block mb-1">Category</label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {['', 'Vegetables', 'Fruits', 'Cereals', 'Pulses', 'Spices', 'Oilseeds'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`filter-chip whitespace-nowrap flex-shrink-0 ${category === cat ? 'active' : ''}`}
                >
                  {cat === '' ? t("allCrops") : cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={loadPrices}
              className="w-full py-2.5 bg-[#166534] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#14532d] transition-colors cursor-pointer text-sm">
              <Search className="w-4 h-4" /> Search Prices
            </button>
          </div>
        </div>
      </div>

      {/* Today's Crop Prices header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <p className="section-label flex items-center gap-1.5 mb-1"><TrendingUp className="w-3.5 h-3.5" /> Market Intelligence</p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1a2e1c]">Today's Crop Prices</h2>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[11px] sm:text-xs text-[#7a9a80]">Last Updated: Today, {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
          <button id="btn-download-prices" onClick={handleDownloadReport} disabled={downloading}
            className="btn-outline text-xs whitespace-nowrap">
            <Download className="w-3.5 h-3.5" /> {downloading ? "Generating..." : "Download CSV"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT: Price Table */}
        <div className="xl:col-span-7 space-y-5">

          {/* ── Grouped Crop Cards: Fruits then Vegetables ── */}
          {(() => {
            const fruits = displayedPrices
              .filter(p => p.category === "Fruits")
              .filter((p, idx, self) => self.findIndex(x => x.cropName === p.cropName) === idx)
              .sort((a, b) => a.cropName.localeCompare(b.cropName));

            const vegetables = displayedPrices
              .filter(p => p.category === "Vegetables")
              .filter((p, idx, self) => self.findIndex(x => x.cropName === p.cropName) === idx)
              .sort((a, b) => a.cropName.localeCompare(b.cropName));

            const cereals = displayedPrices
              .filter(p => p.category === "Cereals")
              .filter((p, idx, self) => self.findIndex(x => x.cropName === p.cropName) === idx)
              .sort((a, b) => a.cropName.localeCompare(b.cropName));

            const pulses = displayedPrices
              .filter(p => p.category === "Pulses")
              .filter((p, idx, self) => self.findIndex(x => x.cropName === p.cropName) === idx)
              .sort((a, b) => a.cropName.localeCompare(b.cropName));

            const spices = displayedPrices
              .filter(p => p.category === "Spices")
              .filter((p, idx, self) => self.findIndex(x => x.cropName === p.cropName) === idx)
              .sort((a, b) => a.cropName.localeCompare(b.cropName));

            const oilseeds = displayedPrices
              .filter(p => p.category === "Oilseeds")
              .filter((p, idx, self) => self.findIndex(x => x.cropName === p.cropName) === idx)
              .sort((a, b) => a.cropName.localeCompare(b.cropName));

            const renderGroup = (label: string, emoji: string, items: MarketPrice[]) => {
              if (items.length === 0) return null;
              return (
                <div key={label} className="space-y-3">
                  {/* Section heading */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-lg">{emoji}</span>
                    <h3 className="text-base font-extrabold text-[#1a2e1c] uppercase tracking-wide">{label}</h3>
                    <div className="flex-1 h-px bg-[#d1e4d5]" />
                    <span className="text-xs text-[#7a9a80] font-mono">{items.length} crops</span>
                  </div>

                  {/* Table wrapper */}
                  <div className="rounded-2xl overflow-hidden border border-[#d1e4d5] shadow-sm">
                    <table className="agri-table w-full">
                      <tbody>
                        {items.map(row => (
                          <tr key={row.id} onClick={() => handleRowSelect(row)}
                            className={`bg-white border-b border-[#d1e4d5] last:border-0 cursor-pointer hover:bg-gray-50 transition-all ${selectedRow?.id === row.id ? "bg-green-50/50" : ""}`}>
                            <td className="p-4 align-top w-24">
                              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-[#d1e4d5]">
                                <img
                                  src={getCropImage(row.cropName)}
                                  alt={row.cropName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=160&h=160&fit=crop&auto=format";
                                  }}
                                />
                              </div>
                            </td>
                            <td className="p-4 align-top">
                              <h4 className="font-bold text-[#1a2e1c] text-base">{row.cropName}</h4>
                              <p className="text-xs text-[#7a9a80] mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">Market: {row.market}</span>
                              </p>
                              <p className="text-xs text-[#7a9a80] mt-1">Updated: Today</p>
                              <button
                                onClick={e => { e.stopPropagation(); setDetailCrop(row); }}
                                className="mt-2 text-xs font-semibold text-[#1a5c38] border border-[#1a5c38] px-3 py-1 rounded hover:bg-[#1a5c38] hover:text-white transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                            <td className="p-4 align-top text-right">
                              <p className="text-xl font-bold text-amber-500 mb-1">
                                ₹{row.modalPrice} <span className="text-xs text-[#7a9a80] font-normal">/ Quintal</span>
                              </p>
                              {row.modalPrice > row.minPrice 
                                ? <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">\u25b2 UP</span>
                                : <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">\u25bc DOWN</span>
                              }
                            </td>
                            <td className="p-4 align-top w-12">
                              <button
                                onClick={e => { e.stopPropagation(); toggleWatchlist(row.cropName); }}
                                className="w-7 h-7 rounded-full flex items-center justify-center border border-[#d1e4d5] hover:border-yellow-400 hover:bg-yellow-50 transition-all"
                                title="Add to watchlist"
                              >
                                <Star className={`w-4 h-4 ${userProfile?.watchlistCrops?.includes(row.cropName) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            };

            if (displayedPrices.length === 0) {
              return (
                <div className="py-12 text-center text-[#7a9a80] text-sm">
                  {loadingPrices ? "Loading prices..." : "No crops found. Try adjusting filters."}
                </div>
              );
            }

            return (
              <div className="space-y-6">
                {renderGroup("Fruits", "🍎", fruits)}
                {renderGroup("Vegetables", "🥦", vegetables)}
                {renderGroup("Cereals", "🌾", cereals)}
                {renderGroup("Pulses", "🫘", pulses)}
                {renderGroup("Spices", "🌶️", spices)}
                {renderGroup("Oilseeds", "🌻", oilseeds)}
              </div>
            );
          })()}

          {/* Available Markets */}
          <div className="bg-white border border-[#d1e4d5] rounded-xl p-5">
            <h4 className="font-bold text-[#1a2e1c] text-sm mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1a5c38]" /> Available Markets
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Kolar APMC","Bengaluru APMC","Mysuru APMC","Tumakuru APMC"].map(mkt => (
                <button key={mkt} className="flex items-center gap-2 p-2.5 border border-[#d1e4d5] rounded-lg text-xs text-[#4a6550] hover:border-[#1a5c38] hover:text-[#1a5c38] transition-colors cursor-pointer">
                  <div className="w-6 h-6 bg-[#edf4ee] rounded flex items-center justify-center flex-shrink-0">🏛️</div>
                  {mkt}
                </button>
              ))}
            </div>
          </div>


        </div>

        {/* RIGHT: Analytics panel */}
        <div className="xl:col-span-5 space-y-5">
          {/* Calculate Crop Value */}
          <CalculateCropValue prices={prices} selectedRow={selectedRow} />

          {/* Why Use AgriConnect */}
          <div className="bg-white border border-[#d1e4d5] rounded-xl p-5">
            <p className="section-label flex items-center gap-1.5 mb-3"><Sprout className="w-3.5 h-3.5" /> Why Use AgriConnect</p>
            <div className="space-y-2">
              {["Real-time crop price updates","Accurate market-wise information","Compare prices between markets","Check earnings based on quantity","Helps farmers make better decisions","Save time & increase profits","100% Free and easy to use"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#4a6550]">
                  <CheckCircle2 className="w-4 h-4 text-[#1a5c38] flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Crop Detail Modal ── */}
      {detailCrop && (() => {
        // All markets carrying this specific crop
        const allMarkets = prices.filter(p => p.cropName === detailCrop.cropName);
        const sorted = [...allMarkets].sort((a, b) => b.modalPrice - a.modalPrice);
        const highest = sorted[0];
        const lowest  = sorted[sorted.length - 1];
        const avgPrice = Math.round(allMarkets.reduce((s, p) => s + p.modalPrice, 0) / (allMarkets.length || 1));
        const priceChange = detailCrop.modalPrice - avgPrice;

        return (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setDetailCrop(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#d1e4d5] bg-[#f4f8f4] rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#d1e4d5] flex-shrink-0">
                    <img src={getCropImage(detailCrop.cropName)} alt={detailCrop.cropName}
                      className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#1a2e1c]">{detailCrop.cropName}</h2>
                    <p className="text-xs text-[#7a9a80] mt-0.5">{allMarkets.length} markets tracked • Prices in ₹/Quintal</p>
                  </div>
                </div>
                <button onClick={() => setDetailCrop(null)}
                  className="p-2 rounded-lg hover:bg-[#e8f2e9] text-[#7a9a80] hover:text-[#1a2e1c] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">

                {/* Summary row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center">
                    <p className="text-[10px] text-green-600 uppercase font-semibold">Highest</p>
                    <p className="text-lg font-extrabold text-green-700 mt-0.5">₹{highest?.modalPrice}</p>
                    <p className="text-[10px] text-green-600 truncate">{highest?.market.split(" ")[0]}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#1a5c38] text-center">
                    <p className="text-[10px] text-white/70 uppercase font-semibold">Avg Price</p>
                    <p className="text-lg font-extrabold text-white mt-0.5">₹{avgPrice}</p>
                    <p className="text-[10px] text-white/70">All markets</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center">
                    <p className="text-[10px] text-red-500 uppercase font-semibold">Lowest</p>
                    <p className="text-lg font-extrabold text-red-600 mt-0.5">₹{lowest?.modalPrice}</p>
                    <p className="text-[10px] text-red-500 truncate">{lowest?.market.split(" ")[0]}</p>
                  </div>
                </div>

                {/* Per-market price table */}
                <div>
                  <h4 className="text-sm font-bold text-[#1a2e1c] flex items-center gap-2 mb-3">
                    <BarChart2 className="w-4 h-4 text-[#1a5c38]" />
                    {detailCrop.cropName} — Price in Each Market
                  </h4>
                  <div className="space-y-2">
                    {sorted.map((m, idx) => {
                      const pct = Math.round(
                        ((m.modalPrice - (lowest?.modalPrice || 0)) /
                        ((highest?.modalPrice || 1) - (lowest?.modalPrice || 0) || 1)) * 100
                      );
                      const isClicked = m.id === detailCrop.id;
                      return (
                        <div key={m.id}
                          className={`p-3.5 rounded-xl border ${isClicked ? "border-[#1a5c38] bg-[#edf4ee]" : "border-[#e8f2e9] bg-[#f4f8f4]"}`}>
                          {/* Rank + market name + price */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0
                                ${idx === 0 ? "bg-amber-400 text-white" : "bg-[#d1e4d5] text-[#1a5c38]"}`}>
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-[#1a2e1c] truncate">{m.market}</p>
                                <p className="text-[10px] text-[#7a9a80] flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />{m.district}
                                  {isClicked && <span className="ml-1 text-[#1a5c38] font-semibold">• Selected</span>}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <p className="text-base font-extrabold text-amber-500">₹{m.modalPrice}</p>
                              <p className="text-[10px] text-[#7a9a80]">modal</p>
                            </div>
                          </div>

                          {/* Min / Max */}
                          <div className="flex gap-4 text-[10px] text-[#7a9a80] mb-2">
                            <span>Min: <span className="font-semibold text-[#4a6550]">₹{m.minPrice}</span></span>
                            <span>Max: <span className="font-semibold text-[#4a6550]">₹{m.maxPrice}</span></span>
                            <span>Date: <span className="font-semibold text-[#4a6550]">{m.date}</span></span>
                          </div>

                          {/* Price bar */}
                          <div className="h-2 rounded-full bg-[#d1e4d5] overflow-hidden">
                            <div className="h-full rounded-full bg-[#1a5c38] transition-all"
                              style={{ width: `${Math.max(4, pct)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
