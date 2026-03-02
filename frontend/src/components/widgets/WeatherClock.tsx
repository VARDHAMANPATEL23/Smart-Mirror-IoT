"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  condition: string;
}

export function WeatherClockWidget() {
  const [time, setTime] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    // Clock setup
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);

    // Weather setup using Open-Meteo (No API Key required)
    const fetchWeather = async () => {
      try {
        // Using approximate coordinates (Replace with browser geolocation later if preferred)
        // Hardcoded to New York for demo purposes: lat 40.71, lon -74.00
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true&temperature_unit=fahrenheit",
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
        });
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const weatherTimer = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => {
      clearInterval(timer);
      clearInterval(weatherTimer);
    };
  }, []);

  if (!time) return <div className="animate-pulse">Loading Date...</div>;

  return (
    <div className="flex w-full h-full flex-wrap items-center justify-between gap-x-6 gap-y-4 content-center">
      <div className="flex flex-col flex-1 min-w-[180px]">
        <span
          className={`text-5xl font-normal tracking-wide text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.6)] font-seven-segment`}
        >
          {time.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
        <span className="text-lg font-bold tracking-wide text-cyan-300 uppercase pb-2 border-b border-white/10 drop-shadow-[0_0_2px_rgba(103,232,249,0.5)] w-max pr-4">
          {time.toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {weather ? (
        <div className="flex items-center gap-3 flex-1 min-w-[150px] sm:justify-end">
          <span
            className={`text-4xl font-normal text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.6)] font-seven-segment`}
          >
            {weather.temp}°F
          </span>
          <span className="text-lg font-bold text-cyan-300 tracking-wide uppercase drop-shadow-[0_0_2px_rgba(103,232,249,0.5)]">
            {weather.condition}
          </span>
        </div>
      ) : (
        <div className="animate-pulse text-cyan-400 font-bold drop-shadow-[0_0_2px_rgba(34,211,238,0.5)] flex-1 min-w-[150px] sm:justify-end flex">
          Fetching...
        </div>
      )}
    </div>
  );
}
