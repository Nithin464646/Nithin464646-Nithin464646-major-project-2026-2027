import React, { useState, useEffect } from "react";
import { Sun, Cloud, CloudRain, Wind, Droplets, MapPin, RefreshCw } from "lucide-react";
import { WeatherData, Language } from "../types";
import { getTranslation } from "../utils/translations";

interface WeatherWidgetProps {
  currentDistrict: string;
  onDistrictChange?: (district: string) => void;
  currentLanguage?: Language;
}

export default function WeatherWidget({ currentDistrict, onDistrictChange, currentLanguage = Language.ENGLISH }: WeatherWidgetProps) {
  const t = (key: string) => getTranslation(currentLanguage, key);
  const [district, setDistrict] = useState(currentDistrict || "Kolar");
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (currentDistrict) setDistrict(currentDistrict);
  }, [currentDistrict]);

  const fetchWeather = async (targetDistrict: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?district=${encodeURIComponent(targetDistrict)}`);
      const weather = await res.json();
      setData(weather);
      if (onDistrictChange) onDistrictChange(targetDistrict);
    } catch (e) {
      console.error("Failed to load weather data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(district); }, [district]);

  const handleAutoLocate = () => {
    setLocating(true);
    setTimeout(() => {
      const options = ["Bengaluru Urban", "Bengaluru Rural", "Ramanagara", "Chikkaballapur", "Kolar"];
      setDistrict(options[Math.floor(Math.random() * options.length)]);
      setLocating(false);
    }, 1200);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "sun": return <Sun id="weather-icon-sun" className="text-amber-400 w-10 h-10" />;
      case "cloud-rain": return <CloudRain id="weather-icon-rain" className="text-blue-400 w-10 h-10" />;
      default: return <Cloud id="weather-icon-cloud" className="text-gray-400 w-10 h-10" />;
    }
  };

  if (!data) return (
    <div className="bg-white border border-[#d1e4d5] rounded-2xl shadow-sm p-6">
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
        <div className="h-8 bg-gray-200 rounded-lg w-1/2" />
        <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
      </div>
    </div>
  );

  return (
    <div id="weather-module" className="bg-white border border-[#d1e4d5] rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="section-label">Weather Intelligence</p>
          <h3 className="text-lg font-bold text-[#1a2e1c] mt-0.5">Local Weather — {data.district}</h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            id="weather-district-select"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="bg-white border border-[#d1e4d5] text-sm text-[#1a2e1c] rounded-lg py-1.5 px-3 focus:outline-none focus:border-[#1a5c38]"
          >
            {["Bengaluru Urban","Bengaluru Rural","Kolar","Chikkaballapur","Tumakuru","Ramanagara","Mandya","Mysuru","Hassan"].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <button
            id="btn-auto-locate"
            onClick={handleAutoLocate}
            disabled={locating}
            className="p-2 border border-[#d1e4d5] rounded-lg hover:bg-[#edf4ee] bg-white transition-colors cursor-pointer text-[#4a6550] disabled:opacity-50"
            title="Auto Locate"
          >
            <MapPin className={`w-4 h-4 ${locating ? "animate-spin text-[#1a5c38]" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <RefreshCw className="w-7 h-7 animate-spin text-[#1a5c38]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Primary temp */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-[#7a9a80] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#1a5c38]" /> {data.district}, Karnataka
                </p>
                <h4 className="text-6xl font-black text-[#1a2e1c] mt-2">{data.temp}°C</h4>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#d1e4d5] shadow-sm">
                {getIconComponent(data.temp > 27 ? "sun" : "cloud-rain")}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-sky-200">
              <div className="p-2.5 bg-white rounded-xl border border-[#e8f2e9] flex items-center gap-2">
                <div className="p-1.5 bg-[#dcfce7] rounded-lg text-[#1a5c38]"><Droplets className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] text-[#7a9a80] uppercase">Humidity</p>
                  <p className="text-sm font-bold text-[#1a2e1c]">{data.humidity}%</p>
                </div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#e8f2e9] flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500"><Wind className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] text-[#7a9a80] uppercase">Wind</p>
                  <p className="text-sm font-bold text-[#1a2e1c]">{data.windSpeed} km/h</p>
                </div>
              </div>
              <div className="col-span-2 p-2.5 bg-white rounded-xl border border-[#e8f2e9] flex items-center gap-2">
                <div className="p-1.5 bg-sky-50 rounded-lg text-sky-500"><CloudRain className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] text-[#7a9a80] uppercase">Rain Forecast</p>
                  <p className="text-sm font-bold text-[#1a2e1c] capitalize">{data.rainForecast}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-gradient-to-br from-[#14532d] to-[#166534] border border-[#d1e4d5]">
            <h5 className="text-xs font-bold text-green-300 uppercase tracking-wider mb-3">Farming Advisory</h5>
            <div className="space-y-3">
              {data.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-300 mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-white/90 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 7-day forecast */}
          <div className="lg:col-span-4">
            <p className="text-[10px] font-bold text-[#7a9a80] uppercase tracking-wider mb-3">7-Day Outlook</p>
            <div className="grid grid-cols-7 gap-1.5">
              {data.forecast7Days.map((f, i) => (
                <div key={i} className="p-2 rounded-lg border border-[#e8f2e9] bg-white hover:bg-[#f0f6f1] hover:border-[#a8cbb0] transition-all flex flex-col items-center text-center gap-1">
                  <span className="text-[10px] text-[#4a6550] font-bold">{f.day}</span>
                  <div className="scale-75">{getIconComponent(f.icon)}</div>
                  <span className="text-sm font-black text-[#1a2e1c]">{f.temp}°</span>
                  <span className="text-[9px] text-[#1a5c38] truncate w-full text-center">{f.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
