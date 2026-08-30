"use client";

import { useEffect, useState } from "react";
import type { BengaluruWeather } from "@/lib/bengaluruWeather";
import { formatTemperature, weatherCodeIcon } from "@/lib/bengaluruWeather";

export default function TopBarBengaluruWeather() {
  const [weather, setWeather] = useState<BengaluruWeather | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/weather/bengaluru")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: BengaluruWeather | null) => {
        if (!cancelled && data?.city) {
          setWeather(data);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  if (!weather) return null;

  return (
    <span className="top-bar-weather" aria-label={`Bengaluru weather: ${weather.condition}, ${formatTemperature(weather.temperatureC)}`}>
      <span className="text-white-50" aria-hidden="true">
        •
      </span>
      <span className="top-bar-weather-icon" aria-hidden="true">
        {weatherCodeIcon(weather.weatherCode)}
      </span>
      <span className="top-bar-weather-city">Bengaluru</span>
      <strong className="top-bar-weather-temp">{formatTemperature(weather.temperatureC)}</strong>
      <span className="top-bar-weather-condition">{weather.condition}</span>
      <span className="top-bar-weather-range">
        H {Math.round(weather.highC)}° / L {Math.round(weather.lowC)}°
      </span>
    </span>
  );
}
