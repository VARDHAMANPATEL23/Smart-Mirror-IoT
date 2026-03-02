"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  condition: string;
  max: number;
  min: number;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    // Weather setup using Open-Meteo
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto",
        );
        const data = await res.json();

        // Open-Meteo weather codes
        const weatherCodeMap: Record<number, string> = {
          0: "Clear Sky",
          1: "Mainly Clear",
          2: "Partly Cloudy",
          3: "Overcast",
          45: "Fog",
          48: "Depositing Rime Fog",
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

        setWeather({
          temp: Math.round(data.current_weather.temperature),
          condition:
            weatherCodeMap[data.current_weather.weathercode] || "Variable",
          max: Math.round(data.daily.temperature_2m_max[0]),
          min: Math.round(data.daily.temperature_2m_min[0]),
        });
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };

    fetchWeather();
    const weatherTimer = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherTimer);
  }, []);

  if (!weather)
    return (
      <div className="animate-pulse text-cyan-400 font-bold">
        Fetching Weather...
      </div>
    );

  return (
    <div className="flex w-full h-full flex-col justify-center items-center text-center gap-2">
      <div className="text-xl font-bold text-cyan-300 tracking-wide uppercase drop-shadow-[0_0_2px_rgba(103,232,249,0.5)]">
        {weather.condition}
      </div>
      <div className="text-6xl font-normal text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.6)] font-seven-segment">
        {weather.temp}°F
      </div>
      <div className="text-sm font-bold text-white/70 uppercase">
        H: {weather.max}°F • L: {weather.min}°F
      </div>
      <div className="mt-2 w-full overflow-hidden text-xs font-bold text-white/50 relative h-4">
        <div className="whitespace-nowrap animate-[scroll_10s_linear_infinite] inline-block">
          Tomorrow: 68°F Partly Cloudy • Day After: 70°F Clear Sky
        </div>
      </div>
    </div>
  );
}
