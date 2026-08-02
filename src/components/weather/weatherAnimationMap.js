export const ANIMATED_WEATHER_STATES = [
  "clear-day",
  "clear-night",
  "partly-cloudy",
  "cloudy",
  "light-rain",
  "heavy-rain",
  "thunderstorm",
  "snow",
  "fog",
  "windy",
  "hot",
  "cold",
  "unknown",
];

export const weatherAnimationMap = {
  "clear-day":{ clouds:0, rain:0, snow:0, mist:false, wind:"ambient", atmosphere:"sunny" },
  "clear-night":{ clouds:0, rain:0, snow:0, mist:false, wind:false, atmosphere:"night" },
  "partly-cloudy":{ clouds:2, rain:0, snow:0, mist:false, wind:false, atmosphere:"soft" },
  cloudy:{ clouds:3, rain:0, snow:0, mist:false, wind:false, atmosphere:"clouded" },
  "light-rain":{ clouds:2, rain:12, snow:0, mist:false, wind:false, atmosphere:"wet" },
  "heavy-rain":{ clouds:3, rain:22, snow:0, mist:false, wind:false, atmosphere:"stormy" },
  thunderstorm:{ clouds:3, rain:24, snow:0, mist:false, wind:false, lightning:true, atmosphere:"stormy" },
  snow:{ clouds:2, rain:0, snow:16, mist:false, wind:false, atmosphere:"cold" },
  fog:{ clouds:0, rain:0, snow:0, mist:true, wind:false, atmosphere:"mist" },
  windy:{ clouds:1, rain:0, snow:0, mist:false, wind:true, atmosphere:"soft" },
  hot:{ clouds:0, rain:0, snow:0, mist:false, wind:"ambient", heat:true, atmosphere:"warm" },
  cold:{ clouds:1, rain:0, snow:0, mist:false, wind:false, frost:true, atmosphere:"cold" },
  unknown:{ clouds:0, rain:0, snow:0, mist:false, wind:false, atmosphere:"neutral" },
};

const conditionMap = {
  clear:"clear-day",
  partly_cloudy:"partly-cloudy",
  cloudy:"cloudy",
  fog:"fog",
  drizzle:"light-rain",
  rain:"light-rain",
  heavy_rain:"heavy-rain",
  thunderstorm:"thunderstorm",
  snow:"snow",
  heavy_snow:"snow",
  sleet:"snow",
  windy:"windy",
  hot:"hot",
  cold:"cold",
};

export function resolveAnimatedWeatherState({
  condition,
  phase,
  isDaytime,
  temperatureF,
  windSpeedMph,
  weatherAvailable=true,
}={}){
  if(!weatherAvailable)return "unknown";
  const normalized=String(condition||"").trim().toLowerCase().replaceAll("-","_");
  const temperature=Number(temperatureF);
  const wind=Number(windSpeedMph);
  if(["clear","partly_cloudy"].includes(normalized)&&Number.isFinite(temperature)){
    if(temperature>=95)return "hot";
    if(temperature<=28)return "cold";
  }
  if(["clear","partly_cloudy"].includes(normalized)&&Number.isFinite(wind)&&wind>=24)return "windy";
  if(normalized==="clear"){
    const night=isDaytime===false||phase==="night";
    return night?"clear-night":"clear-day";
  }
  return conditionMap[normalized]||"unknown";
}
