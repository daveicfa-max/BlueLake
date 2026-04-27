import "server-only";
import { LAKE } from "./lake";

export type Weather = {
  temperature: number;
  apparent: number;
  weatherCode: number;
  description: string;
  windSpeed: number;
};

const WEATHER_CODES: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Drizzle",
  53: "Drizzle",
  55: "Drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Showers",
  81: "Showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm + hail",
  99: "Thunderstorm + hail",
};

export async function getCurrentWeather(): Promise<Weather | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(LAKE.latitude));
  url.searchParams.set("longitude", String(LAKE.longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",
  );
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("timezone", LAKE.timezone);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const c = data?.current;
    if (!c) return null;
    const code = Number(c.weather_code);
    return {
      temperature: Math.round(Number(c.temperature_2m)),
      apparent: Math.round(Number(c.apparent_temperature)),
      weatherCode: code,
      description: WEATHER_CODES[code] ?? "—",
      windSpeed: Math.round(Number(c.wind_speed_10m)),
    };
  } catch {
    return null;
  }
}
