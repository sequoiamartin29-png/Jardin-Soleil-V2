import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { useEstateEnvironment } from "../../context/EstateEnvironmentContext";
import { resolveAnimatedWeatherState, weatherAnimationMap } from "./weatherAnimationMap";

export default function useWeatherAnimation({ paused=false, enabled=true }={}){
  const environment=useEstateEnvironment();
  const systemReducedMotion=useReducedMotion();
  const { settings,visualWeather,weather,condition,phase,season,windy }=environment;
  const hasWeather=Boolean(weather)||Boolean(settings.previewCondition);
  const state=resolveAnimatedWeatherState({
    condition,
    phase,
    isDaytime:visualWeather?.isDaytime,
    temperatureF:weather?.temperatureF,
    windSpeedMph:weather?.windSpeedMph,
    weatherAvailable:hasWeather,
  });
  const reducedMotion=Boolean(systemReducedMotion||settings.reducedMotion);
  const disabled=!enabled||(!settings.liveWeather&&!settings.previewCondition);
  return useMemo(()=>({
    state:disabled?"unknown":state,
    config:weatherAnimationMap[disabled?"unknown":state],
    phase,
    season,
    windy:Boolean(windy),
    paused:Boolean(paused),
    reducedMotion,
    quality:String(settings.quality||"Balanced").toLowerCase(),
    disabled,
  }),[disabled,paused,phase,reducedMotion,season,settings.quality,state,windy]);
}
