const groups = {
  clear:[0], partly_cloudy:[1,2], cloudy:[3], fog:[45,48], drizzle:[51,53,55],
  rain:[61,63,80,81], heavy_rain:[65,82], sleet:[56,57,66,67], snow:[71,73,77,85], heavy_snow:[75,86], thunderstorm:[95,96,99],
};

export const conditionFromOpenMeteoCode = (code) => Object.entries(groups).find(([,codes]) => codes.includes(Number(code)))?.[0] || "clear";
export const weatherConditionLabels = { clear:"Clear",partly_cloudy:"Partly cloudy",cloudy:"Cloudy",fog:"Fog",drizzle:"Drizzle",rain:"Rain",heavy_rain:"Heavy rain",thunderstorm:"Thunderstorm",snow:"Snow",heavy_snow:"Heavy snow",sleet:"Sleet",windy:"Windy",hot:"Hot",cold:"Cold" };

export const normalizeOpenMeteoWeather = (payload, location, observed = new Date()) => {
  const current=payload.current || {}, mappedCondition=conditionFromOpenMeteoCode(current.weather_code);
  const temperature=Number.isFinite(Number(current.temperature_2m)) ? Number(current.temperature_2m) : null;
  const wind=Number(current.wind_speed_10m || 0), gust=Number(current.wind_gusts_10m || 0);
  const atmosphericOnly=["clear","partly_cloudy"].includes(mappedCondition);
  const condition=atmosphericOnly&&temperature!==null&&temperature>=95?"hot":atmosphericOnly&&temperature!==null&&temperature<=28?"cold":atmosphericOnly&&wind>=24?"windy":mappedCondition;
  return {
    condition,
    intensity:["heavy_rain","heavy_snow","thunderstorm"].includes(condition) ? "heavy" : ["drizzle"].includes(condition) ? "light" : "moderate",
    temperatureF:temperature,
    apparentTemperatureF:Number.isFinite(Number(current.apparent_temperature)) ? Number(current.apparent_temperature) : null,
    windSpeedMph:wind,
    windGustMph:gust,
    precipitationProbability:Number(current.precipitation_probability || 0),
    precipitation:Number(current.precipitation || 0),
    precipitationType:["snow","heavy_snow"].includes(condition) ? "snow" : condition==="sleet" ? "mixed" : ["rain","heavy_rain","drizzle","thunderstorm"].includes(condition) ? "rain" : null,
    cloudCover:Number(current.cloud_cover || 0),
    sunrise:payload.daily?.sunrise?.[0] || "",
    sunset:payload.daily?.sunset?.[0] || "",
    locationLabel:location.label,
    latitude:location.latitude,
    longitude:location.longitude,
    observedAt:current.time || observed.toISOString(),
    fetchedAt:observed.toISOString(),
    source:"Open-Meteo",
    isLive:true,
    isStale:false,
    timezone:payload.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time",
    temperature,
    apparentTemperature:Number.isFinite(Number(current.apparent_temperature)) ? Number(current.apparent_temperature) : null,
    wind,
    weatherCode:Number(current.weather_code || 0),
  };
};
