import React, { useState, useEffect } from "react";
import { 
  Search, Filter, TrendingUp, TrendingDown, ArrowRightLeft, Star, Download, 
  Calendar, Info, Sparkles, CheckCircle2, ChevronRight, HelpCircle, Activity, MapPin, Sprout
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar 
} from "recharts";
import { MarketPrice, MLModelType, PredictionPayload, User } from "../types";
import { FOCUS_DISTRICTS, DISTRICT_MARKETS } from "../data/marketData";

interface MarketPriceDashboardProps {
  userProfile: User | null;
  onUpdateProfile: (updated: User) => void;
}

export default function MarketPriceDashboard({ userProfile, onUpdateProfile }: MarketPriceDashboardProps) {
  // Price states
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [market, setMarket] = useState("");
  const [category, setCategory] = useState("");
  
  // Selection for comparison / detail
  const [selectedRow, setSelectedRow] = useState<MarketPrice | null>(null);
  const [historicalData, setHistoricalData] = useState<any>(null);
  
  // Prediction / ML state
  const [predictionData, setPredictionData] = useState<PredictionPayload | null>(null);
  const [selectedModel, setSelectedModel] = useState<MLModelType>("Random Forest");
  
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
    setPredictionData(null);

    try {
      // 1. Fetch 14-days historical curves
      const histRes = await fetch(`/api/prices/historical?cropName=${encodeURIComponent(row.cropName)}&market=${encodeURIComponent(row.market)}`);
      const hist = await histRes.json();
      setHistoricalData(hist);

      // 2. Fetch 7-day forecasting predictions
      const predRes = await fetch(`/api/predict?cropName=${encodeURIComponent(row.cropName)}&market=${encodeURIComponent(row.market)}`);
      const pred = await predRes.json();
      setPredictionData(pred);
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

  // Calculate market-compare data (chosen crop in different districts)
  const getComparisonData = () => {
    if (!selectedRow) return [];
    return prices
      .filter(p => p.cropName === selectedRow.cropName)
      .slice(0, 5)
      .map(p => ({
        market: p.market.split(" ")[0], // shorter nickname
        modalPrice: p.modalPrice,
        maxPrice: p.maxPrice
      }));
  };

  // Stylistic helpers for recommendation tags
  const getRecommendationStyle = (rec: string) => {
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
      {/* Search & Filter */}
      <div className="bg-white border border-[#d1e4d5] rounded-xl p-6">
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
            <select className="w-full px-3 py-2 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38] bg-white">
              <option>Karnataka</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#4a6550] block mb-1">District</label>
            <select id="search-filter-district" value={district} onChange={(e) => { setDistrict(e.target.value); setMarket(""); }}
              className="w-full px-3 py-2 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38] bg-white">
              <option value="">Bengaluru Rural</option>
              {FOCUS_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#4a6550] block mb-1">Market</label>
            <select id="search-filter-category" value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-[#d1e4d5] rounded-lg text-sm focus:outline-none focus:border-[#1a5c38] bg-white">
              <option value="">All Categories</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Cereals">Cereals</option>
              <option value="Pulses">Pulses</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={loadPrices}
              className="w-full py-2.5 bg-[#1a5c38] text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#134429] transition-colors cursor-pointer text-sm">
              <Search className="w-4 h-4" /> Search Prices
            </button>
          </div>
        </div>
      </div>

      {/* Today's Crop Prices header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1a2e1c]">Today's Crop Prices</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#7a9a80]">Last Updated: Today, {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
          <button id="btn-download-prices" onClick={handleDownloadReport} disabled={downloading}
            className="btn-outline text-xs py-1.5 px-3">
            <Download className="w-3.5 h-3.5" /> {downloading ? "Generating..." : "Download CSV"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT: Price Table */}
        <div className="xl:col-span-7 space-y-5">
          {/* Featured price cards */}
          {displayedPrices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedPrices.slice(0, 2).map((row) => (
                <div key={row.id} onClick={() => handleRowSelect(row)}
                  className={`bg-white border rounded-xl p-4 flex gap-4 items-center cursor-pointer hover:shadow-md transition-all ${selectedRow?.id === row.id ? "border-[#1a5c38] shadow-md" : "border-[#d1e4d5]"}`}>
                  <div className="w-20 h-20 bg-gradient-to-br from-[#edf4ee] to-[#d1e4d5] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">🌾</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#1a2e1c] text-base">{row.cropName}</h4>
                    <p className="text-xl font-bold text-amber-500 mt-1">₹{row.modalPrice} <span className="text-xs text-[#7a9a80] font-normal">/ Quintal</span></p>
                    <p className="text-xs text-[#7a9a80] mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Market: {row.market}</p>
                    <p className="text-xs text-[#7a9a80]">Updated: Today</p>
                    <button className="mt-2 text-xs font-semibold text-[#1a5c38] border border-[#1a5c38] px-3 py-1 rounded hover:bg-[#1a5c38] hover:text-white transition-colors">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detailed Price Table */}
          <div className="bg-white border border-[#d1e4d5] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#e8f2e9] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1a5c38]" />
              <h4 className="font-bold text-[#1a2e1c] text-sm">Detailed Price Table</h4>
            </div>
            {loadingPrices ? (
              <div className="py-12 text-center text-[#7a9a80] text-sm">Loading prices...</div>
            ) : displayedPrices.length === 0 ? (
              <div className="py-12 text-center text-[#7a9a80] text-sm">No crops found. Try adjusting filters.</div>
            ) : (
              <table id="tbl-mandi-prices" className="agri-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Market</th>
                    <th>Min Price (₹/Quintal)</th>
                    <th>Max Price (₹/Quintal)</th>
                    <th>Average Price (₹/Quintal)</th>
                    <th>Track</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPrices.map((row) => {
                    const isWatched = userProfile?.watchlistCrops?.includes(row.cropName);
                    return (
                      <tr key={row.id} onClick={() => handleRowSelect(row)} className={`cursor-pointer ${selectedRow?.id === row.id ? "bg-green-50" : ""}`}>
                        <td className="font-semibold text-[#1a2e1c]">{row.cropName}</td>
                        <td className="text-[#4a6550]">{row.market}</td>
                        <td>₹{row.minPrice}</td>
                        <td>₹{row.maxPrice}</td>
                        <td className="font-bold text-[#1a5c38]">₹{row.modalPrice}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => toggleWatchlist(row.cropName)} title="Watchlist" className="cursor-pointer hover:scale-110 transition-transform">
                            <Star className={`w-4 h-4 ${isWatched ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

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

          {/* Bar chart comparison */}
          {selectedRow && (
            <div className="bg-white border border-[#d1e4d5] rounded-xl p-5">
              <h4 className="text-sm font-bold text-[#1a2e1c] mb-1 flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-[#1a5c38]" /> Market Comparison
              </h4>
              <p className="text-xs text-[#7a9a80] mb-4">{selectedRow.cropName} prices across APMC markets</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8f2e9" />
                    <XAxis dataKey="market" stroke="#7a9a80" fontSize={11} />
                    <YAxis stroke="#7a9a80" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #d1e4d5", borderRadius: "8px" }} />
                    <Bar dataKey="modalPrice" fill="#1a5c38" name="Modal Price" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Analytics panel */}
        <div className="xl:col-span-5 space-y-5">
          {selectedRow ? (
            <>
              <div className="bg-white border border-[#d1e4d5] rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="badge-green">{selectedRow.category}</span>
                  <span className="text-xs text-[#7a9a80] flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#1a5c38]" /> Today</span>
                </div>
                <h3 className="text-2xl font-bold text-[#1a2e1c]">{selectedRow.cropName}</h3>
                <p className="text-sm text-[#7a9a80] mt-1">Market: <span className="text-[#4a6550] font-semibold">{selectedRow.market}</span></p>
                <div className="grid grid-cols-3 gap-3 mt-4 p-4 bg-[#f4f8f4] rounded-xl border border-[#e8f2e9]">
                  <div className="text-center"><p className="text-xs text-[#7a9a80]">Min</p><p className="font-bold text-[#1a2e1c] text-sm mt-1">₹{selectedRow.minPrice}</p></div>
                  <div className="text-center border-x border-[#e8f2e9]"><p className="text-xs text-[#1a5c38] font-semibold">Modal Avg</p><p className="font-bold text-[#1a5c38] text-base mt-0.5">₹{selectedRow.modalPrice}</p></div>
                  <div className="text-center"><p className="text-xs text-[#7a9a80]">Max</p><p className="font-bold text-[#1a2e1c] text-sm mt-1">₹{selectedRow.maxPrice}</p></div>
                </div>
              </div>

              <div className="bg-white border border-[#d1e4d5] rounded-xl p-5">
                <p className="section-label flex items-center gap-1.5 mb-1"><Sparkles className="w-3.5 h-3.5" /> AI Forecast</p>
                <h4 className="text-base font-bold text-[#1a2e1c] mb-4">7-Day ML Price Projections</h4>
                {loadingHistory ? (
                  <div className="py-12 flex flex-col items-center gap-2 text-[#7a9a80]">
                    <div className="w-6 h-6 border-2 border-[#1a5c38] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Computing estimates...</span>
                  </div>
                ) : predictionData ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#f4f8f4] border border-[#e8f2e9]">
                      {["Linear Regression","Random Forest","Decision Tree","AdaBoost"].map(m => (
                        <button key={m} onClick={() => setSelectedModel(m as MLModelType)}
                          className={`flex-1 text-[10px] font-bold py-1.5 px-1 rounded cursor-pointer transition-colors ${selectedModel === m ? "bg-[#1a5c38] text-white" : "text-[#4a6550] hover:text-[#1a5c38]"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#f4f8f4] border border-[#e8f2e9] rounded-xl">
                        <p className="text-xs text-[#7a9a80]">Confidence</p>
                        <p className="text-2xl font-bold text-[#1a5c38]">{predictionData.predictions[0].confidenceScore}%</p>
                      </div>
                      <div className={`p-3 rounded-xl border ${getRecommendationStyle(predictionData.recommendation).color}`}>
                        <p className="text-xs text-[#7a9a80]">Decision</p>
                        <p className="text-sm font-bold mt-1">{getRecommendationStyle(predictionData.recommendation).badge} {getRecommendationStyle(predictionData.recommendation).text}</p>
                      </div>
                    </div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={predictionData.predictions}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e8f2e9" />
                          <XAxis dataKey="date" stroke="#7a9a80" fontSize={10} />
                          <YAxis stroke="#7a9a80" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #d1e4d5", borderRadius: "8px" }} />
                          <Line type="monotone" dataKey="predictedPrice" stroke="#1a5c38" strokeWidth={2.5} dot={{ fill: "#fff", strokeWidth: 2, r: 3 }} name="Predicted" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="p-3.5 bg-[#f4f8f4] border border-[#e8f2e9] rounded-xl">
                      <p className="text-xs font-bold text-[#1a5c38] mb-2">Model Comparison (Tomorrow)</p>
                      {Object.entries(predictionData.comparisonModels).map(([model, price]) => (
                        <div key={model} className="flex justify-between py-1 border-b border-[#e8f2e9] last:border-0 text-xs">
                          <span className="text-[#7a9a80]">{model}</span>
                          <span className={`font-bold ${selectedModel === model ? "text-[#1a5c38]" : "text-[#4a6550]"}`}>₹{price}/Qtl</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-[#7a9a80] text-sm">Select a crop to view projections.</div>
                )}
              </div>

              {/* Calculate crop value */}
              <div className="bg-white border border-[#d1e4d5] rounded-xl p-5">
                <p className="section-label flex items-center gap-1.5 mb-3"><Sprout className="w-3.5 h-3.5" /> Calculate Crop Value</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-[#4a6550] font-semibold block mb-1">Crop</label>
                    <div className="px-3 py-2.5 rounded-lg border border-[#d1e4d5] text-sm text-[#1a2e1c] bg-[#f4f8f4]">{selectedRow.cropName}</div>
                  </div>
                  <div>
                    <label className="text-xs text-[#4a6550] font-semibold block mb-1">Current Price</label>
                    <div className="px-3 py-2.5 rounded-lg border border-[#d1e4d5] text-sm text-[#1a2e1c] bg-[#f4f8f4]">₹{selectedRow.modalPrice}/Qtl</div>
                  </div>
                </div>
                <div className="p-3 bg-[#1a5c38]/5 border border-[#d1e4d5] rounded-xl text-center">
                  <p className="text-xs text-[#7a9a80]">Total Value (per Quintal)</p>
                  <p className="text-2xl font-bold text-[#1a5c38] mt-1">₹ {selectedRow.modalPrice}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-[#d1e4d5] rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-64">
              <Info className="w-10 h-10 text-[#d1e4d5] mb-3" />
              <h5 className="font-bold text-[#1a2e1c]">No Crop Selected</h5>
              <p className="text-sm text-[#7a9a80] mt-1 max-w-64">Click on any crop row in the table to see detailed analytics and ML price forecasts.</p>
            </div>
          )}

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
    </div>
  );
}
