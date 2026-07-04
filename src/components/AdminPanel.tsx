import React, { useState, useEffect } from "react";
import { 
  Users, TrendingUp, Award, PlayCircle, Settings, Edit, Plus, FileText, CheckCircle2, AlertTriangle, BarChart as ChartIcon, Sparkles, RefreshCw 
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { User, MarketPrice, GovScheme, EducationalGuide } from "../types";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"stats" | "farmers" | "prices" | "schemes" | "guides">("stats");
  
  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Database arrays
  const [farmers, setFarmers] = useState<any[]>([]);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [updating, setUpdating] = useState(false);

  // Price form override state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newModalPrice, setNewModalPrice] = useState("");
  const [newMinPrice, setNewMinPrice] = useState("");
  const [newMaxPrice, setNewMaxPrice] = useState("");

  // New Scheme Form State
  const [schName, setSchName] = useState("");
  const [schBenefits, setSchBenefits] = useState("");
  const [schEligibility, setSchEligibility] = useState("");
  const [schDoc, setSchDoc] = useState("");
  const [schLink, setSchLink] = useState("");
  const [schCategory, setSchCategory] = useState("Irrigation & Drip");
  const [schSubsidy, setSchSubsidy] = useState("80");
  const [schLand, setSchLand] = useState("5");

  // New Guide Form State
  const [gdTitle, setGdTitle] = useState("");
  const [gdDesc, setGdDesc] = useState("");
  const [gdCat, setGdCat] = useState("Organic Farming");
  const [gdType, setGdType] = useState<"document" | "video2d" | "video3d">("video2d");
  const [gdTime, setGdTime] = useState("10 mins");
  const [gdAuthor, setGdAuthor] = useState("");
  const [gdSize, setGdSize] = useState("");

  // System status alerts
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadAdminData = async () => {
    try {
      // 1. Fetch Analytics details
      const scoreRes = await fetch("/api/admin/stats");
      const score = await scoreRes.json();
      setAnalytics(score);

      // 2. Fetch farmers
      const farmRes = await fetch("/api/admin/farmers");
      const farm = await farmRes.json();
      setFarmers(farm);

      // 3. Fetch APMC rows
      const prcRes = await fetch("/api/prices");
      const prc = await prcRes.json();
      setPrices(prc);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const triggerAlertMessage = (msg: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    }
  };

  // Submit Price Override Command
  const handlePriceOverride = async (id: string) => {
    if (!newModalPrice) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/prices/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          modalPrice: Number(newModalPrice),
          minPrice: Number(newMinPrice) || undefined,
          maxPrice: Number(newMaxPrice) || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerAlertMessage("Mandi row price overridden successfully. Forecast alert dispatched.", "success");
        setEditingPriceId(null);
        // Refresh pricing set
        loadAdminData();
      } else {
        triggerAlertMessage(data.error || "Override rejected", "error");
      }
    } catch (e) {
      triggerAlertMessage("Failed to override price", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Submit New Scheme Setup
  const handleAddScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schName || !schBenefits) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/schemes/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: schName,
          benefits: schBenefits,
          eligibility: schEligibility,
          requiredDocuments: schDoc.split(",").map(d => d.trim()).filter(Boolean),
          applyLink: schLink,
          category: schCategory,
          subsidyPercentage: Number(schSubsidy) || 50,
          maxLandRequirement: Number(schLand) || undefined
        })
      });
      if (res.ok) {
        triggerAlertMessage("Government Scheme initialized. Farmer alarm notifications broadcasted.", "success");
        // Clear inputs
        setSchName("");
        setSchBenefits("");
        setSchEligibility("");
        setSchDoc("");
        setSchLink("");
        loadAdminData();
      }
    } catch (e) {
      triggerAlertMessage("Failed saving new scheme", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Submit New Scholarly Guide Setup
  const handleAddGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdTitle || !gdDesc) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/guides/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: gdTitle,
          description: gdDesc,
          category: gdCat,
          type: gdType,
          duration: gdTime,
          author: gdAuthor || "AgriConnect Agronomists",
          fileSize: gdSize || "11 MB"
        })
      });
      if (res.ok) {
        triggerAlertMessage("Educational Guide uploaded and registered in library.", "success");
        setGdTitle("");
        setGdDesc("");
        setGdAuthor("");
        setGdSize("");
        loadAdminData();
      }
    } catch (e) {
      triggerAlertMessage("Failed loading guide", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (!analytics) return <div className="text-[#7a9a80] text-center py-12">Loading Admin Console Security...</div>;

  return (
    <div id="admin-panel-root" className="pb-12 space-y-6">
      
      {/* Upper Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 border border-[#d1e4d5] bg-white rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-[#7a9a80] uppercase">Active Farmers</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h4 className="text-3xl font-bold text-[#1a2e1c]">{analytics.farmersCount}</h4>
            <span className="text-xs text-[#1a5c38] font-bold">+14% MoM</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 border border-[#d1e4d5] bg-white rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-[#7a9a80] uppercase">APMC Mandi Rows</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h4 className="text-3xl font-bold text-[#1a2e1c]">{analytics.totalMandiRows}</h4>
            <span className="text-xs text-[#1a5c38] font-bold">9 focus districts</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 border border-[#d1e4d5] bg-white rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-[#7a9a80] uppercase">Avg Model Accuracy</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h4 className="text-3xl font-bold text-[#1a5c38]">{analytics.avgPredictionAccuracy}%</h4>
            <span className="text-xs text-[#1a5c38] font-semibold">RMS Fitted</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 border border-[#d1e4d5] bg-white rounded-xl flex items-center justify-between text-[#1a5c38] shadow-sm">
          <div>
            <p className="text-xs font-semibold text-[#7a9a80] uppercase">AI Security State</p>
            <h4 className="text-sm font-bold text-[#1a2e1c] mt-2">Enforced (Active)</h4>
          </div>
          <Settings className="w-8 h-8 text-[#1a5c38]/40 animate-spin" />
        </div>
      </div>

      {/* Forms Banner Feedback alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl border border-green-200 bg-green-50 text-xs text-green-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#1a5c38]" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-xs text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-650" /> {errorMsg}
        </div>
      )}

      {/* Main Tabs controller */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-2 p-4 border border-[#d1e4d5] bg-white rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-[#7a9a80] uppercase tracking-wider px-3 mb-2">Systems Operations</p>
          {[
            { tag: "stats", label: "Registry Analytics", icon: ChartIcon },
            { tag: "farmers", label: "Farmer Directory", icon: Users },
            { tag: "prices", label: "Mandi Price Overwrites", icon: TrendingUp },
            { tag: "schemes", label: "Setup Subsidies / Schemes", icon: Award },
            { tag: "guides", label: "Guides & Videos Hub", icon: PlayCircle }
          ].map((item) => (
            <button
              key={item.tag}
              onClick={() => setActiveTab(item.tag as any)}
              className={`w-full text-left text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer border ${activeTab === item.tag ? "bg-[#1a5c38] border-[#1a5c38] text-white font-bold" : "border-transparent text-[#4a6550] hover:bg-[#edf4ee] hover:text-[#1a5c38]"}`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="lg:col-span-9 p-6 border border-[#d1e4d5] bg-white rounded-2xl min-h-120 shadow-sm">
          
          {/* TAB 1: SYSTEM METRICS GRAPH */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#1a5c38] tracking-wider uppercase">Systems Analytics Metrics</span>
              <h3 className="text-lg font-bold text-[#1a2e1c]">Farmer Growth & Scheme Applications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Farmer Registration progress line graph */}
                <div className="p-4 border border-[#d1e4d5] bg-[#f4f8f4] rounded-xl">
                  <p className="text-xs font-semibold text-[#4a6550] uppercase mb-3">6-Months Sign-up Traction trajectory</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8f2e9" />
                        <XAxis dataKey="month" stroke="#7a9a80" fontSize={10} />
                        <YAxis stroke="#7a9a80" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #d1e4d5", borderRadius: "8px" }} />
                        <Line type="monotone" dataKey="users" stroke="#1a5c38" strokeWidth={2} name="Total User Base" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Scheme Applications bar chart */}
                <div className="p-4 border border-[#d1e4d5] bg-[#f4f8f4] rounded-xl">
                  <p className="text-xs font-semibold text-[#4a6550] uppercase mb-3">Subsidy Request metrics distribution</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.schemeUsage}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8f2e9" />
                        <XAxis dataKey="name" stroke="#7a9a80" fontSize={8} />
                        <YAxis stroke="#7a9a80" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #d1e4d5", borderRadius: "8px" }} />
                        <Bar dataKey="applications" fill="#1a5c38" name="Applications" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FARMERS DIRECTORY */}
          {activeTab === "farmers" && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#1a5c38] tracking-wider uppercase">Administrative Ledger</span>
              <h3 className="text-lg font-bold text-[#1a2e1c]">Registries Database Directory</h3>

              <div className="overflow-x-auto rounded-xl border border-[#d1e4d5]">
                <table className="agri-table w-full">
                  <thead>
                    <tr>
                      <th>Farmer Name</th>
                      <th>Email Address</th>
                      <th>Mandi District</th>
                      <th className="text-right">Land (Acr)</th>
                      <th className="text-right">Preferred Crop</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farmers.map((farm) => (
                      <tr key={farm.id} className="hover:bg-[#f4f8f4]">
                        <td className="font-semibold text-[#1a2e1c]">{farm.name}</td>
                        <td className="text-[#4a6550]">{farm.email}</td>
                        <td>{farm.village}, {farm.district}</td>
                        <td className="text-right font-mono">{farm.landSize} acr</td>
                        <td className="text-right font-semibold text-[#1a5c38]">
                          {Array.isArray(farm.crops) ? farm.crops.join(", ") : farm.crops || "Tomato"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRICE OVERWRITES */}
          {activeTab === "prices" && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#1a5c38] tracking-wider uppercase">Pricing Adjustment Dashboard</span>
              <h3 className="text-lg font-bold text-[#1a2e1c]">Live Overwrites for APMC Mandi price cards</h3>

              <div className="space-y-3 max-h-110 overflow-y-auto pr-1">
                {prices.slice(0, 15).map((row) => (
                  <div key={row.id} className="p-4 rounded-xl border border-[#d1e4d5] bg-[#f4f8f4] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#1a2e1c]">{row.cropName}</h4>
                      <p className="text-xs text-[#7a9a80] mt-0.5">{row.market} ({row.district})</p>
                    </div>

                    {editingPriceId === row.id ? (
                      <div className="flex flex-wrap items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input
                          type="number"
                          placeholder="Modal"
                          value={newModalPrice}
                          onChange={e => setNewModalPrice(e.target.value)}
                          className="w-20 bg-white text-xs border border-[#d1e4d5] text-[#1a2e1c] p-1.5 px-2 rounded focus:outline-none focus:border-[#1a5c38]"
                        />
                        <input
                          type="number"
                          placeholder="Min"
                          value={newMinPrice}
                          onChange={e => setNewMinPrice(e.target.value)}
                          className="w-16 bg-white text-xs border border-[#d1e4d5] text-[#1a2e1c] p-1.5 px-2 rounded focus:outline-none focus:border-[#1a5c38]"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={newMaxPrice}
                          onChange={e => setNewMaxPrice(e.target.value)}
                          className="w-16 bg-white text-xs border border-[#d1e4d5] text-[#1a2e1c] p-1.5 px-2 rounded focus:outline-none focus:border-[#1a5c38]"
                        />

                        <button
                          onClick={() => handlePriceOverride(row.id)}
                          disabled={updating}
                          className="text-2xs p-1.5 px-3 cursor-pointer bg-[#1a5c38] hover:bg-[#134429] text-white font-bold rounded"
                        >
                          Overrule
                        </button>
                        <button
                          onClick={() => setEditingPriceId(null)}
                          className="text-2xs p-1.5 px-3 cursor-pointer bg-white border border-[#d1e4d5] text-[#4a6550] rounded hover:bg-[#f4f8f4]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-[#4a6550] pr-2">
                          Modal: <span className="font-bold text-[#1a5c38]">₹{row.modalPrice}</span>
                        </span>
                        
                        <button
                          onClick={() => {
                            setEditingPriceId(row.id);
                            setNewModalPrice(String(row.modalPrice));
                            setNewMinPrice(String(row.minPrice));
                            setNewMaxPrice(String(row.maxPrice));
                          }}
                          className="p-1.5 px-3 text-xs bg-white hover:bg-[#edf4ee] border border-[#d1e4d5] text-[#111] rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#1a5c38]" /> Override Price
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SETUP SCHEMES */}
          {activeTab === "schemes" && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#1a5c38] tracking-wider uppercase">Subsidy Provisioner Configuration</span>
              <h3 className="text-lg font-bold text-[#1a2e1c]">Setup and deploy new government schemes</h3>

              <form onSubmit={handleAddScheme} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#4a6550]">Scheme Campaign Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Krishi Honda polythene subsidy"
                      value={schName}
                      onChange={e => setSchName(e.target.value)}
                      className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4a6550]">Category Headings</label>
                    <select
                      value={schCategory}
                      onChange={e => setSchCategory(e.target.value)}
                      className="w-full bg-white mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                    >
                      <option value="Organic Farming">Organic Farming</option>
                      <option value="Irrigation & Rainwater">Irrigation & Water Preservation</option>
                      <option value="Financial Support & Welfare">Financial Support & Welfare</option>
                      <option value="Solar Power Subsidy">Solar Power Subsidy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4a6550]">Scheme Benefits & Relief Outline</label>
                  <textarea
                    placeholder="Provide detailed description of resources, subsidies, and criteria..."
                    value={schBenefits}
                    onChange={e => setSchBenefits(e.target.value)}
                    rows={2}
                    className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#4a6550]">Target Eligibility Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Small landholder holding less than 5 acres"
                      value={schEligibility}
                      onChange={e => setSchEligibility(e.target.value)}
                      className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4a6550]">Required Documents (comma separated)</label>
                    <input
                      type="text"
                      placeholder="RTC Pahani, Aadhaar, Bank Details"
                      value={schDoc}
                      onChange={e => setSchDoc(e.target.value)}
                      className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#4a6550]">Subsidy Relief Percentage</label>
                    <input
                      type="number"
                      value={schSubsidy}
                      onChange={e => setSchSubsidy(e.target.value)}
                      className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-[#4a6550]">Bureaucratic Application Link</label>
                    <input
                      type="text"
                      placeholder="e.g. https://raitamitra.karnataka.gov.in"
                      value={schLink}
                      onChange={e => setSchLink(e.target.value)}
                      className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="py-2.5 px-5 rounded-xl cursor-pointer bg-[#1a5c38] text-white font-bold transition-all hover:bg-[#134429] text-xs shadow-sm"
                >
                  {updating ? "Deploying..." : "Deploy Govt Scheme"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: REGISTER SCHOLAR MANUALS */}
          {activeTab === "guides" && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#1a5c38] tracking-wider uppercase">Scholar Core Upload</span>
              <h3 className="text-lg font-bold text-[#1a2e1c]">Upload and list farming tutorials</h3>

              <form onSubmit={handleAddGuide} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#4a6550]">Manual Title</label>
                    <input
                      type="text"
                      placeholder="Soil preservation under dry winds of Tumakuru"
                      value={gdTitle}
                      onChange={e => setGdTitle(e.target.value)}
                      className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4a6550]">Subject Category</label>
                    <select
                      value={gdCat}
                      onChange={e => setGdCat(e.target.value)}
                      className="w-full bg-white mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                    >
                      <option value="Organic Farming">Organic Farming</option>
                      <option value="Pest Control">Pest Control</option>
                      <option value="Irrigation">Irrigation</option>
                      <option value="Fertilizers">Fertilizers</option>
                      <option value="Crop Management">Crop Management</option>
                      <option value="Smart Farming">Smart Farming</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4a6550]">Detailed Synopsis</label>
                  <textarea
                    placeholder="Provide a comprehensive abstract for scholarly reference..."
                    value={gdDesc}
                    onChange={e => setGdDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#4a6550]">Presentation Type</label>
                    <select
                      value={gdType}
                      onChange={e => setGdType(e.target.value as any)}
                      className="w-full bg-white mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                    >
                      <option value="document">Scholarly PDF Document</option>
                      <option value="video2d">2D High-definition Video</option>
                      <option value="video3d">Interactive 3D Simulation</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4a6550]">Academic Author/Institution</label>
                    <input
                      type="text"
                      placeholder="GKVK Bengaluru"
                      value={gdAuthor}
                      onChange={e => setGdAuthor(e.target.value)}
                      className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4a6550]">Duration / length</label>
                    <input
                      type="text"
                      placeholder="12 mins or 15 pages"
                      value={gdTime}
                      onChange={e => setGdTime(e.target.value)}
                      className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4a6550]">Estimated file weight</label>
                    <input
                      type="text"
                      placeholder="4.2 MB"
                      value={gdSize}
                      onChange={e => setGdSize(e.target.value)}
                      className="w-full bg-[#f4f8f4] mt-1 border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:border-[#1a5c38]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="py-2.5 px-5 rounded-xl cursor-pointer bg-[#1a5c38] text-white font-bold transition-all hover:bg-[#134429] text-xs shadow-sm"
                >
                  {updating ? "Compressing..." : "Launch Manual"}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
