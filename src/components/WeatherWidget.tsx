import React, { useState, useEffect } from "react";
import { Sun, Cloud, CloudRain, Wind, Droplets, MapPin, RefreshCw } from "lucide-react";
import { WeatherData } from "../types";

interface WeatherWidgetProps {
  currentDistrict: string;
  onDistrictChange?: (district: string) => void;
}

export default function WeatherWidget({ currentDistrict, onDistrictChange }: WeatherWidgetProps) {
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
    <div className="bg-white border border-[#d1e4d5] rounded-xl p-6 text-center text-[#7a9a80] text-sm">
      Loading Weather Data...
    </div>
  );

  return (
    <div id="weather-module" className="bg-white border border-[#d1e4d5] rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="section-label">Weather Update</p>
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
          <div className="lg:col-span-4 p-5 rounded-xl bg-[#f4f8f4] border border-[#e8f2e9]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-[#7a9a80] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#1a5c38]" /> {data.district}, Karnataka
                </p>
                <h4 className="text-5xl font-bold text-[#1a2e1c] mt-2">{data.temp}°C</h4>
                <p className="text-sm text-[#4a6550] mt-1 capitalize">{data.rainForecast}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#d1e4d5] shadow-sm">
                {getIconComponent(data.temp > 27 ? "sun" : "cloud-rain")}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-[#e8f2e9]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#dcfce7] rounded-lg text-[#1a5c38]"><Droplets className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] text-[#7a9a80] uppercase">Humidity</p>
                  <p className="text-sm font-bold text-[#1a2e1c]">{data.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500"><Wind className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] text-[#7a9a80] uppercase">Wind</p>
                  <p className="text-sm font-bold text-[#1a2e1c]">{data.windSpeed} km/h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-gradient-to-br from-[#edf4ee] to-[#f4f8f4] border border-[#d1e4d5]">
            <h5 className="text-xs font-bold text-[#1a5c38] uppercase tracking-wider mb-3">Farming Advisory</h5>
            <div className="space-y-3">
              {data.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1a5c38] mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-[#4a6550] leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 7-day forecast */}
          <div className="lg:col-span-4">
            <p className="text-[10px] font-bold text-[#7a9a80] uppercase tracking-wider mb-3">7-Day Outlook</p>
            <div className="grid grid-cols-7 gap-1.5">
              {data.forecast7Days.map((f, i) => (
                <div key={i} className="p-2 rounded-lg border border-[#e8f2e9] bg-[#f4f8f4] flex flex-col items-center text-center gap-1">
                  <span className="text-[10px] text-[#7a9a80] font-medium">{f.day}</span>
                  <div className="scale-75">{getIconComponent(f.icon)}</div>
                  <span className="text-xs text-[#1a2e1c] font-bold">{f.temp}°</span>
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
