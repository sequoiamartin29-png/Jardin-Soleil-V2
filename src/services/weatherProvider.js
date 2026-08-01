import { normalizeOpenMeteoWeather } from "../utils/normalizeWeather";

/**
 * WeatherProvider contract used by Jardin Soleil features.
 * A future provider only needs to return the normalized estate weather shape.
 *
 * @typedef {Object} WeatherProvider
 * @property {string} id
 * @property {(input: {location: Object, signal?: AbortSignal}) => Promise<Object>} getForecast
 */

const currentFields = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "precipitation",
  "precipitation_probability",
  "weather_code",
  "cloud_cover",
  "wind_speed_10m",
  "wind_gusts_10m",
];

const dailyFields = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "precipitation_probability_max",
  "sunrise",
  "sunset",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
];

export const openMeteoWeatherProvider = {
  id:"open-meteo",
  async getForecast({ location, signal }) {
    const params = new URLSearchParams({
      latitude:String(location.latitude),
      longitude:String(location.longitude),
      current:currentFields.join(","),
      daily:dailyFields.join(","),
      temperature_unit:"fahrenheit",
      wind_speed_unit:"mph",
      precipitation_unit:"inch",
      timezone:"auto",
      forecast_days:"8",
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
    if (!response.ok) throw new Error("Weather service unavailable");
    return normalizeOpenMeteoWeather(await response.json(), location);
  },
};

let activeWeatherProvider = openMeteoWeatherProvider;

export const getWeatherProvider = () => activeWeatherProvider;

export const setWeatherProvider = (provider) => {
  if (!provider?.id || typeof provider.getForecast !== "function") {
    throw new TypeError("A weather provider must include an id and getForecast().");
  }
  activeWeatherProvider = provider;
};

export const fetchEstateWeather = (input) => getWeatherProvider().getForecast(input);
