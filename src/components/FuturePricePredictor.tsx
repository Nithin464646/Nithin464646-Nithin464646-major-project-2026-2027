import React, { useState, useEffect } from "react";
import { 
  Sparkles, Calendar, Wind, Thermometer, ShieldAlert, CheckCircle2, 
  HelpCircle, AlertTriangle, ArrowRight, LineChart as ChartIcon, 
  RefreshCw, TrendingUp, TrendingDown, BookOpen, BrainCircuit, Minus
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";
import { FOCUS_DISTRICTS, DISTRICT_MARKETS, CROP_LIST } from "../data/marketData";
import { User, Language } from "../types";
import { getTranslation } from "../utils/translations";

interface FuturePricePredictorProps {
  userProfile: User | null;
  currentLanguage?: Language;
}

interface AdvancedPredictionResult {
  label: string;
  date: string;
  predictedPrice: number;
  predictedMin: number;
  predictedMax: number;
  confidenceScore: number;
}

interface AdvancedPredictionPayload {
  cropName: string;
  market: string;
  currentEstPrice: number;
  trend: "UP" | "DOWN" | "STABLE";
  decision: "SELL_NOW" | "HOLD" | "SELL_LATER";
  idealMax: number;
  dataPoints: AdvancedPredictionResult[];
  advisoryReport: string;
  poweredBy: string;
}

export default function FuturePricePredictor({ userProfile, currentLanguage = Language.ENGLISH }: FuturePricePredictorProps) {
  const t = (key: string) => getTranslation(currentLanguage, key);

  // Input form states
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [selectedDistrict, setSelectedDistrict] = useState(userProfile?.district || "Kolar");
  const [selectedMarket, setSelectedMarket] = useState("");
  const timeframe = "30";
  const [weatherFactor, setWeatherFactor] = useState("normal"); // "normal" | "heavy_rain" | "drought" | "unseasonal"
  const [soilFactor, setSoilFactor] = useState("medium"); // "low" | "medium" | "high"
  const [pestFactor, setPestFactor] = useState("none"); // "none" | "mild" | "high_outbreak"

  // Response prediction result state
  const [prediction, setPrediction] = useState<AdvancedPredictionPayload | null>(null);
  
  // Loading simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [loadingError, setLoadingError] = useState("");

  // Staggered simulation steps messages
  const simulationSteps = [
    "Contacting Kolar/Bangalore regional APMC data nodes...",
    "Retrieving multi-year seasonal commodity baseline prices...",
    "Fitting 4-model algebraic regression layers (OLS, Forest, AdaBoost)...",
    "Integrating weather anomaly triggers and moisture coefficients...",
    "Synthesizing soil carbon values and leaf-pest risk indicators...",
    "Querying Gemini AI Core for agronomical risk advisory report..."
  ];

  // Adjust markets list dynamically based on the selected District
  const availableMarkets = DISTRICT_MARKETS[selectedDistrict] || [];

  useEffect(() => {
    if (availableMarkets.length > 0) {
      setSelectedMarket(availableMarkets[0]);
    }
  }, [selectedDistrict]);

  // Run detailed predictive simulation
  const runSimulatePrediction = async () => {
    setIsSimulating(true);
    setSimulationStep(0);
    setLoadingError("");
    setPrediction(null);

    // Stagger simulation logs sequentially for a highly polished interactive feel
    const interval = setInterval(() => {
      setSimulationStep((prev) => {
        if (prev < simulationSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 150);

    try {
      const res = await fetch("/api/predict/advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName: selectedCrop,
          market: selectedMarket || (availableMarkets.length ? availableMarkets[0] : "Kolar APMC (Veg & Tomato)"),
          timeframe,
          weather: weatherFactor,
          soil: soilFactor,
          pests: pestFactor
        })
      });

      if (!res.ok) {
        throw new Error("Local model solver failed");
      }

      const data = await res.json();
      
      // Keep loader running slightly for smooth visual entry
      setTimeout(() => {
        clearInterval(interval);
        setPrediction(data);
        setIsSimulating(false);
      }, 800);

    } catch (e: any) {
      clearInterval(interval);
      setIsSimulating(false);
      setLoadingError("We had an issue parsing the future price matrices. Please check back shortly.");
      console.error(e);
    }
  };

  // Automatically re-run simulation whenever any input parameter changes
  useEffect(() => {
    if (selectedMarket) {
      runSimulatePrediction();
    }
  }, [selectedCrop, selectedMarket, timeframe, weatherFactor, soilFactor, pestFactor]);

  // Style helpers
  const getDecisionTag = (dec: string) => {
    switch (dec) {
      case "SELL_NOW":
        return { text: "SELL IMMEDIATELY", color: "bg-red-50 text-red-700 border-red-200", icon: TrendingDown };
      case "SELL_LATER":
        return { text: "HARVEST & SELL LATER", color: "bg-green-50 text-green-700 border-green-200", icon: TrendingUp };
      default:
        return { text: "HOLD & TRACK PRICES", color: "bg-amber-50 text-amber-700 border-amber-200", icon: RefreshCw };
    }
  };

  return (
    <div id="future-price-forecaster-segment" className="space-y-6">
      
      {/* 1. Header Hero Segment */}
      <div className="p-6 rounded-3xl border border-[#d1e4d5] bg-gradient-to-br from-[#edf4ee] to-[#d1e4d5] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="section-label flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#166534]" /> AI / ML Module
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-[#1a2e1c]">
              {t("aiPredictorTitle")}
            </h2>
            <p className="text-sm text-[#7a9a80] max-w-2xl leading-relaxed">
              {t("aiPredictorSub")}
            </p>
          </div>

          <button
            id="btn-re-simulate"
            onClick={runSimulatePrediction}
            disabled={isSimulating}
            className="md:self-center px-4 py-2.5 bg-[#166534] text-white font-bold text-xs rounded-full flex items-center justify-center gap-2 transition-all hover:bg-[#14532d] disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <BrainCircuit className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
            {isSimulating ? t("simulating") : t("runSimulation")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: Simulation Control Board */}
        <section id="simulation-control-card" className="lg:col-span-4 p-5 rounded-2xl border border-[#d1e4d5] bg-white space-y-5">
          <div className="border-b border-[#e8f2e9] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#166534]">
              {t("simParameters")}
            </h3>
            <p className="text-xs text-[#7a9a80] mt-0.5">Customize environment parameters to predict crop rates</p>
          </div>

          <div className="space-y-4">
            
            {/* Crop Select */}
            <div>
              <label className="text-xs font-semibold text-[#4a6550] block mb-1.5 uppercase tracking-wide">
                {t("targetCrop")}
              </label>
              <select
                id="param-select-crop"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full bg-[#f4f8f4] border-1.5 border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#166634]/10"
              >
                {CROP_LIST.map((crop) => (
                  <option key={crop.name} value={crop.name}>{crop.name} ({crop.category})</option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div>
              <label className="text-xs font-semibold text-[#4a6550] block mb-1.5 uppercase tracking-wide">
                Mandi District
              </label>
              <select
                id="param-select-district"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-[#f4f8f4] border-1.5 border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#166634]/10"
              >
                {FOCUS_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Market Select */}
            <div>
              <label className="text-xs font-semibold text-[#4a6550] block mb-1.5 uppercase tracking-wide">
                Target APMC Mandi
              </label>
              <select
                id="param-select-market"
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="w-full bg-[#f4f8f4] border-1.5 border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#166634]/10"
              >
                {availableMarkets.length === 0 ? (
                  <option value="">No local APMC found</option>
                ) : (
                  availableMarkets.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))
                )}
              </select>
            </div>



            {/* Weather Anomaly Select */}
            <div>
              <label className="text-xs font-semibold text-[#4a6550] block mb-1.5 uppercase tracking-wide">
                Weather Scenario
              </label>
              <select
                id="param-select-weather"
                value={weatherFactor}
                onChange={(e) => setWeatherFactor(e.target.value)}
                className="w-full bg-[#f4f8f4] border-1.5 border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#166634]/10"
              >
                <option value="normal">Normal Monsoons (Standard Supply)</option>
                <option value="heavy_rain">Heavy Rains / Floods (Decay risk, Supply Squeeze)</option>
                <option value="drought">Drought monsoons (Water deficit, high mid-term rate)</option>
                <option value="unseasonal">Unseasonal Squalls (Early crop rot, rate spikes)</option>
              </select>
            </div>

            {/* Soil health Factor */}
            <div>
              <label className="text-xs font-semibold text-[#4a6550] block mb-1.5 uppercase tracking-wide">
                Soil Organic Carbon Status
              </label>
              <select
                id="param-select-soil"
                value={soilFactor}
                onChange={(e) => setSoilFactor(e.target.value)}
                className="w-full bg-[#f4f8f4] border-1.5 border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#166634]/10"
              >
                <option value="high">High Carbon (&gt;0.75% Premium Grade Crops)</option>
                <option value="medium">Medium Standard Carbon (0.5% - 0.75% Grade-A)</option>
                <option value="low">Sub-optimal status (&lt;0.50% Soil Quality anomaly)</option>
              </select>
            </div>

            {/* Pest Outbreak risk */}
            <div>
              <label className="text-xs font-semibold text-[#4a6550] block mb-1.5 uppercase tracking-wide">
                Leaf/Pest Outbreak Hazard
              </label>
              <select
                id="param-select-pests"
                value={pestFactor}
                onChange={(e) => setPestFactor(e.target.value)}
                className="w-full bg-[#f4f8f4] border-1.5 border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#166634]/10"
              >
                <option value="none">Eco-safe (Strict biological safety - No Outbreak)</option>
                <option value="mild">Seasonal blight spots (Minor production drops)</option>
                <option value="high_outbreak">Heavy Entomological outbreak (Widespread crop rot)</option>
              </select>
            </div>

          </div>

          <button
            id="btn-trigger-simulator"
            onClick={runSimulatePrediction}
            disabled={isSimulating}
            className="btn-primary w-full justify-center py-3"
          >
            <RefreshCw className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
            {isSimulating ? "Computing Mathematical Weights..." : "Simulate Crop Forecast"}
          </button>
        </section>

        {/* RIGHT COMPONENT: Prediction curves outputs & agronomical reports */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* A: SIMULATION LOADING LOG BOARD */}
          {isSimulating && (
            <div id="simulation-loading-panel" className="p-8 rounded-2xl border border-[#d1e4d5] bg-white flex flex-col justify-center items-center min-h-[460px] text-center space-y-6 shadow-sm">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-[#edf4ee] border-t-[#1a5c38] rounded-full animate-spin" />
                <BrainCircuit className="w-6 h-6 text-[#1a5c38] absolute inset-0 m-auto animate-pulse" />
              </div>

              <div className="space-y-2 max-w-sm w-full">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#1a2e1c]">
                  Calculating Pricing Models
                </h4>
                <p className="text-xs text-[#7a9a80] italic leading-relaxed h-8">
                  "{simulationSteps[simulationStep]}"
                </p>
                <div className="space-y-3 mt-6 w-full flex flex-col items-center">
                  <div className="skeleton w-full h-[12px] rounded"></div>
                  <div className="skeleton w-[75%] h-[8px] rounded"></div>
                  <div className="skeleton w-[50%] h-[8px] rounded"></div>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex gap-2 text-gray-300 pt-2">
                {simulationSteps.map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i <= simulationStep ? "bg-[#1a5c38] scale-110 shadow-md" : "bg-gray-200"}`} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* B: SIMULATION ERROR BOX */}
          {loadingError && (
            <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 flex flex-col items-center justify-center py-16 text-center space-y-4 shadow-sm">
              <AlertTriangle className="w-10 h-10 text-rose-600" />
              <h4 className="text-base font-bold text-rose-800">Simulation Error</h4>
              <p className="text-sm text-rose-600 max-w-md leading-relaxed">{loadingError}</p>
              <button 
                onClick={runSimulatePrediction} 
                className="py-2 px-4 bg-white text-[#1a5c38] font-bold rounded-xl border border-[#d1e4d5] hover:bg-[#f4f8f4] cursor-pointer text-xs"
              >
                Retry Simulation Model Setup
              </button>
            </div>
          )}

          {/* C: DETAILED PREDICTIONS DISPLAY PANEL */}
          {prediction && !isSimulating && (
            <div id="simulation-results-board" className="space-y-6 animate-fade-in">
              
              {/* 1. KPIs Overlay Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Modal Expected price starting */}
                <div className="p-4 rounded-xl border border-[#d1e4d5] bg-white shadow-sm">
                  <span className="text-[10px] font-semibold text-[#7a9a80] uppercase tracking-wider block">
                    Starting Base Price
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-xl font-bold text-[#1a2e1c]">
                      ₹{prediction.currentEstPrice}
                    </p>
                    <span className="text-xs text-[#7a9a80]">/Quintal</span>
                  </div>
                  <p className="text-[10px] text-[#7a9a80] mt-1 uppercase">Adjusted by soil & pests</p>
                </div>

                {/* Expected Peak Peak Target Rate */}
                <div className="p-4 rounded-xl border border-green-200 bg-green-50/50 shadow-sm">
                  <span className="text-[10px] font-semibold text-[#1a5c38] uppercase tracking-wider block">
                    Projected Max Peak Price
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-xl font-bold text-[#1a5c38]">
                      ₹{prediction.idealMax}
                    </p>
                    <span className="text-xs text-[#1a5c38]">/Quintal</span>
                  </div>
                  <p className="text-[10px] text-[#1a5c38]/70 mt-1 uppercase">Recommended Target rate</p>
                </div>

                {/* Suggested Sowing harvest Decision */}
                <div className={`p-4 rounded-xl border shadow-sm ${getDecisionTag(prediction.decision).color}`}>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
                    Strategic Sowing / Sales Guide
                  </span>
                  <div className="mt-2.5">
                    {prediction.decision === "SELL_NOW" && (
                      <div className="rec-banner-sell-now flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-800" />
                        <span className="text-red-800 font-bold">SELL IMMEDIATELY</span>
                      </div>
                    )}
                    {prediction.decision === "HOLD" && (
                      <div className="rec-banner-hold flex items-center gap-3">
                        <Minus className="w-5 h-5 text-amber-800" />
                        <span className="text-amber-800 font-bold">HOLD & TRACK PRICES</span>
                      </div>
                    )}
                    {prediction.decision === "SELL_LATER" && (
                      <div className="rec-banner-sell-later flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-800" />
                        <span className="text-green-800 font-bold">HARVEST & SELL LATER</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <span>Forecast Trend:</span>
                    {prediction.trend === "UP" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-200"><TrendingUp className="w-4 h-4" />UP</span>
                    )}
                    {prediction.trend === "DOWN" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold border border-red-200"><TrendingDown className="w-4 h-4" />DOWN</span>
                    )}
                    {prediction.trend === "STABLE" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold border border-amber-200"><Minus className="w-4 h-4" />STABLE</span>
                    )}
                  </div>
                </div>

              </div>

              {/* 2. Recharts Timeline Forecasting Line Chart */}
              <div className="p-5 rounded-2xl border border-[#d1e4d5] bg-white space-y-4 shadow-sm">
                <p className="section-label mb-3">{timeframe}-Day Daily Price Forecast</p>
                <div className="bg-[#f0f6f1] rounded-2xl p-4 border border-[#d1e4d5]">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-[#166534] tracking-wider uppercase flex items-center gap-1.5">
                        <ChartIcon className="w-4 h-4 text-[#166534]" /> Daily Price Trajectory Simulation
                      </h4>
                      <p className="text-xs text-[#7a9a80]">
                        Predicted Modal Price vs Min/Max corridors for {prediction.cropName} ({prediction.market}) — {prediction.dataPoints.length} Days
                      </p>
                    </div>
                    
                    <span className="px-2.5 py-1 text-[10px] bg-white border border-[#d1e4d5] text-[#166534] font-bold rounded-lg self-start">
                      {prediction.dataPoints.length} Daily Points
                    </span>
                  </div>

                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prediction.dataPoints}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8f2e9" />
                        <XAxis dataKey="label" stroke="#7a9a80" fontSize={10} tickLine={false} interval={timeframe === "30" ? 4 : 0} />
                        <YAxis stroke="#7a9a80" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "#fff", 
                            border: "1px solid #d1e4d5", 
                            borderRadius: "12px",
                            color: "#1a2e1c"
                          }}
                        />
                        <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                        
                        <Line 
                          type="monotone" 
                          dataKey="predictedMax" 
                          stroke="#0ea5e9" 
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          dot={false}
                          name="Upper Corridor (Max ₹)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="predictedPrice" 
                          stroke="#166534" 
                          strokeWidth={2.5} 
                          dot={timeframe === "30" ? false : { fill: "#fff", stroke: "#166534", strokeWidth: 2, r: 4 }} 
                          name="Model Modal Price (₹)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="predictedMin" 
                          stroke="#f43f5e" 
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          dot={false}
                          name="Lower Corridor (Min ₹)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* All Daily Predictions List (Scrollable for 30 Days) */}
                <div className="border border-[#d1e4d5] rounded-2xl overflow-hidden mt-4 shadow-sm bg-white">
                  <div className="bg-[#166534] text-white px-4 py-2.5 text-xs font-bold flex justify-between items-center">
                    <span>Day & Date ({prediction.dataPoints.length} Days Predicted)</span>
                    <span>Predicted Rates (₹/Quintal)</span>
                  </div>
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-[#d1e4d5]">
                    {prediction.dataPoints.map((pt, idx) => (
                      <div key={pt.label} className={`flex justify-between items-center px-4 py-2.5 text-sm hover:bg-[#e8f2e9] transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f0f6f1]'}`}>
                        <div className="flex flex-col">
                          <span className="font-bold text-[#166534] text-sm">{pt.label}</span>
                          <span className="text-[11px] text-[#7a9a80] font-medium">{pt.date}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-extrabold text-[#1a2e1c] text-sm">₹{pt.predictedPrice.toLocaleString('en-IN')} <span className="text-[10px] text-[#7a9a80] font-normal">/ Qtl</span></span>
                          <span className="text-[10px] text-green-700 font-semibold">Min: ₹{pt.predictedMin} | Max: ₹{pt.predictedMax}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Expert Agronomical and Price Advisory Report */}
              <div className="p-6 rounded-2xl border border-[#d1e4d5] bg-white relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#1a5c38]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex justify-between items-center border-b border-[#e8f2e9] pb-3 mb-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#1a2e1c] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#166534]" /> Agronomical & Price Forecasting Advisory
                  </h4>
                  <span className="text-[10px] font-bold text-[#166534] bg-[#edf4ee] px-2 py-0.5 rounded border border-[#d1e4d5]">
                    {prediction.poweredBy}
                  </span>
                </div>

                <div className="text-sm text-[#4a6550] leading-relaxed space-y-3 whitespace-pre-line">
                  {prediction.advisoryReport}
                </div>

                <div className="mt-5 pt-4 border-t border-[#e8f2e9] flex flex-wrap gap-4 text-xs text-[#7a9a80]">
                  <span className="flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-cyan-600" /> Climatic Weight: <span className="font-semibold text-[#4a6550]">{weatherFactor.toUpperCase()}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-[#166534]" /> Soil Carbon Status: <span className="font-semibold text-[#4a6550]">{soilFactor.toUpperCase()}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Pest Hazard: <span className="font-semibold text-[#4a6550]">{pestFactor.toUpperCase()}</span>
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* D: INITIAL FALLBACK EMPTY STATE */}
          {!prediction && !isSimulating && (
            <div className="p-8 rounded-2xl border border-[#d1e4d5] bg-white flex flex-col justify-center items-center py-24 text-center space-y-3.5 min-h-[460px] shadow-sm">
              <BrainCircuit className="w-12 h-12 text-[#d1e4d5] animate-pulse" />
              <h4 className="text-sm font-bold text-[#1a2e1c]">Forecasting Grid Inactive</h4>
              <p className="text-xs text-[#7a9a80] max-w-sm leading-relaxed">
                Configure your target farming conditions on the Left parameter cards and trigger the ML solver code to render 30-day daily commodity rate trajectories.
              </p>
              <button
                onClick={runSimulatePrediction}
                className="py-2.5 px-5 bg-[#166534] text-white font-bold rounded-full text-xs hover:bg-[#14532d] cursor-pointer transition-colors shadow-sm"
              >
                Trigger Baseline Estimation
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
