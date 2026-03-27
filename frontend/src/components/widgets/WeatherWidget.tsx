"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSun, Sun } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  max: number;
  min: number;
  tomorrow: { max: number; condition: string };
  dayAfter: { max: number; condition: string };
}

// Open-Meteo weather codes
const weatherCodeMap: Record<number, string> = {
  0: "Clear Sky",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime Fog",
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Dense Drizzle",
  61: "Slight Rain",
  63: "Moderate Rain",
  65: "Heavy Rain",
  71: "Slight Snow",
  73: "Moderate Snow",
  75: "Heavy Snow",
  95: "Thunderstorm",
};

export function WeatherWidget({ config }: { config?: any }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const lat = config?.lat || "40.7128";
  const lon = config?.lon || "-74.0060";
  const unit = config?.unit || "celsius";
  const uStr = unit === "fahrenheit" ? "F" : "C";

  // Force loading skeleton when coordinates or unit mutate
  useEffect(() => {
    setWeather(null);
  }, [lat, lon, unit]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&unit=${unit}`);
        if (!res.ok) return;
        
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const currentCode = data.current_weather?.weathercode || 0;
        const tomorrowCode = data.daily?.weathercode?.[1] || 1;
        const dayAfterCode = data.daily?.weathercode?.[2] || 1;
        
        setWeather({
          temp: Math.round(data.current_weather?.temperature || 0),
          condition: weatherCodeMap[currentCode] || "Clear Sky",
          max: Math.round(data.daily?.temperature_2m_max?.[0] || 0),
          min: Math.round(data.daily?.temperature_2m_min?.[0] || 0),
          tomorrow: {
            max: Math.round(data.daily?.temperature_2m_max?.[1] || 0),
            condition: weatherCodeMap[tomorrowCode] || "Clear Sky",
          },
          dayAfter: {
            max: Math.round(data.daily?.temperature_2m_max?.[2] || 0),
            condition: weatherCodeMap[dayAfterCode] || "Clear Sky",
          }
        });
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };

    fetchWeather();
    const weatherTimer = setInterval(fetchWeather, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(weatherTimer);
  }, [lat, lon, unit]); // Added unit to dependency array

  if (!weather) return (
    <div className="flex h-full items-center justify-center animate-pulse text-cyan-400/50 font-bold text-[10px] tracking-widest uppercase">
      Fetching Region...
    </div>
  );

  return (
    <div className="flex w-full h-full flex-col justify-center items-center text-center gap-1 p-2">
      <div className="text-[12px] font-bold text-cyan-400 tracking-[0.2em] uppercase drop-shadow-[0_0_2px_rgba(34,211,238,0.3)]">
        {weather.condition}
      </div>
      
      <div className="flex items-start">
        <span className="text-5xl font-light text-white tracking-tighter drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]">
          {weather.temp}
        </span>
        <span className="text-2xl font-light text-white/50 mt-1">°{uStr}</span>
      </div>
      
      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
        H {weather.max}°{uStr} • L {weather.min}°{uStr}
      </div>
      
      <div className="mt-3 w-full overflow-hidden text-[9px] font-bold text-white/30 uppercase tracking-widest relative">
        <div className="whitespace-nowrap animate-[scroll_10s_linear_infinite] inline-block">
          Tomorrow: {weather.tomorrow.max}°{uStr} {weather.tomorrow.condition} • Day After: {weather.dayAfter.max}°{uStr} {weather.dayAfter.condition}
        </div>
      </div>
    </div>
  );
}
