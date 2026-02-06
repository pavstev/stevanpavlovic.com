import type { APIRoute } from "astro";

// Define the Open-Meteo response structure we care about
interface OpenMeteoResponse {
  current: {
    is_day: number;
    precipitation: number;
    temperature_2m: number;
    weather_code: number;
  };
}

export const GET: APIRoute = async () => {
  // Belgrade Coordinates: 44.7866° N, 20.4489° E
  const lat = 44.7866;
  const lon = 20.4489;

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,precipitation,weather_code&timezone=Europe%2FBelgrade`,
    );

    if (!res.ok) throw new Error("Weather API failed");

    const data = await res.json();

    // Calculate local time manually to be precise server-side
    const belgradeTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Belgrade" });
    const hour = new Date(belgradeTime).getHours();

    // Determine status based on time
    // 11 PM - 7 AM = Sleeping
    const isSleeping = hour >= 23 || hour < 7;

    return new Response(
      JSON.stringify({
        code: data.current.weather_code,
        isDay: !!data.current.is_day,
        localTime: belgradeTime,
        precip: data.current.precipitation,
        status: isSleeping ? "sleeping" : "active",
        temp: Math.round(data.current.temperature_2m),
      }),
      {
        headers: {
          "Cache-Control": "public, max-age=300", // Cache 5 mins
          "Content-Type": "application/json",
        },
        status: 200,
      },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Weather unavailable" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};
