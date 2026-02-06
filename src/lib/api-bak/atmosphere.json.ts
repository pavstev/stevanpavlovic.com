import type { APIRoute } from "astro";

import { fetchWeatherApi } from "openmeteo";

export const GET: APIRoute = async () => {
  // Belgrade Coordinates
  const lat = 44.7866;
  const lon = 20.4489;
  const url = "https://api.open-meteo.com/v1/forecast";

  // Define parameters strictly.
  // IMPORTANT: The order of variables in 'current' determines the index later.
  const params = {
    current: "temperature_2m,is_day,weather_code,precipitation",
    latitude: [lat],
    longitude: [lon],
    timezone: "Europe/Belgrade",
  };

  try {
    // 1. Fetch data using the SDK
    const responses = await fetchWeatherApi(url, params);

    // 2. Process the location (we only requested one)
    const response = responses[0];

    // 3. Extract the current weather block
    const current = response.current();

    if (!current) {
      throw new Error("No current weather data received");
    }

    // 4. Extract values by index matching the 'current' string above
    // Index 0: temperature_2m
    // Index 1: is_day
    // Index 2: weather_code
    // Index 3: precipitation
    const tempVar = current.variables(0);
    const isDayVar = current.variables(1);
    const weatherCodeVar = current.variables(2);
    const precipVar = current.variables(3);

    if (!tempVar || !isDayVar || !weatherCodeVar || !precipVar) {
      throw new Error("Missing weather variable data");
    }

    const temperature = tempVar.value();
    const isDayVal = isDayVar.value();
    const weatherCode = weatherCodeVar.value();
    const precipitation = precipVar.value();

    // 5. Logic for local time and status (kept from your original code)
    const belgradeTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Belgrade" });
    const hour = new Date(belgradeTime).getHours();

    // 11 PM - 7 AM = Sleeping
    const isSleeping = hour >= 23 || hour < 7;

    return new Response(
      JSON.stringify({
        code: weatherCode,
        isDay: !!isDayVal, // Convert 1/0 number to boolean
        localTime: belgradeTime,
        precip: precipitation,
        status: isSleeping ? "sleeping" : "active",
        temp: Math.round(temperature),
      }),
      {
        headers: {
          "Cache-Control": "public, max-age=300",
          "Content-Type": "application/json",
        },
        status: 200,
      },
    );
  } catch (e) {
    console.error("Weather API Error:", e);
    return new Response(JSON.stringify({ error: "Weather unavailable" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};
