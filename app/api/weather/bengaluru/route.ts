import { NextResponse } from "next/server";
import {
  type BengaluruWeather,
  weatherCodeLabel,
} from "@/lib/bengaluruWeather";

export const revalidate = 1800;

type OpenMeteoResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    weather_code?: number;
  };
  daily?: {
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
};

export async function GET() {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", "12.9716");
    url.searchParams.set("longitude", "77.5946");
    url.searchParams.set("current", "temperature_2m,weather_code");
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
    url.searchParams.set("timezone", "Asia/Kolkata");
    url.searchParams.set("forecast_days", "1");

    const response = await fetch(url, { next: { revalidate: 1800 } });
    if (!response.ok) {
      return NextResponse.json({ error: "Weather unavailable." }, { status: 502 });
    }

    const data = (await response.json()) as OpenMeteoResponse;
    const weatherCode = data.current?.weather_code ?? data.daily?.weather_code?.[0] ?? 3;
    const temperatureC = data.current?.temperature_2m ?? data.daily?.temperature_2m_max?.[0];
    const highC = data.daily?.temperature_2m_max?.[0];
    const lowC = data.daily?.temperature_2m_min?.[0];

    if (temperatureC == null || highC == null || lowC == null) {
      return NextResponse.json({ error: "Weather data incomplete." }, { status: 502 });
    }

    const payload: BengaluruWeather = {
      city: "Bengaluru",
      temperatureC,
      highC,
      lowC,
      condition: weatherCodeLabel(weatherCode),
      weatherCode,
      updatedAt: data.current?.time ?? new Date().toISOString(),
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("[GET /api/weather/bengaluru]", error);
    return NextResponse.json({ error: "Could not load weather." }, { status: 500 });
  }
}
