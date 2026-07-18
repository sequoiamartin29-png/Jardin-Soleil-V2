import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { determineDayPhase, determineSeason } from "../utils/determineSeason";
import { normalizeOpenMeteoWeather, weatherConditionLabels } from "../utils/normalizeWeather";

const EnvironmentContext=createContext(null);
const CACHE_MS=20*60*1000;
const defaultSettings={liveWeather:true,seasonalEffects:true,dayNight:true,wildlife:true,buddy:true,quality:window.matchMedia?.("(max-width: 760px)").matches?"Balanced":"Full",reducedMotion:window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||false,sound:false,previewCondition:"",previewSeason:""};
const defaultLocation={label:"Delaware",latitude:39,longitude:-75.5,source:"default"};
const loadJson=(key,fallback)=>{try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback;}catch{return fallback;}};
const migrateCachedWeather=(cached)=>!cached?null:cached.temperatureF!==undefined?cached:{...cached,temperatureF:cached.temperature??null,apparentTemperatureF:cached.apparentTemperature??null,windSpeedMph:cached.wind||0,windGustMph:cached.windGust||0,condition:cached.condition||"clear",source:cached.source||"Open-Meteo",fetchedAt:cached.fetchedAt||cached.observedAt||new Date(0).toISOString(),isLive:false,isStale:true};

export function EstateEnvironmentProvider({children}){
  const [settings,setSettings]=useState(()=>({...defaultSettings,...loadJson("jardinSoleilEnvironmentSettings",{})}));
  const [estateLocation,setEstateLocation]=useState(()=>loadJson("jardinSoleilWeatherLocation",defaultLocation));
  const [weather,setWeather]=useState(()=>migrateCachedWeather(loadJson("jardinSoleilWeatherCache",null)));
  const [status,setStatus]=useState(weather?"cached":"idle");
  const [error,setError]=useState("");
  const [now,setNow]=useState(()=>new Date());
  const requestRef=useRef(null);

  useEffect(()=>{localStorage.setItem("jardinSoleilEnvironmentSettings",JSON.stringify(settings));},[settings]);
  useEffect(()=>{localStorage.setItem("jardinSoleilWeatherLocation",JSON.stringify(estateLocation));},[estateLocation]);
  useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),60000);return()=>window.clearInterval(timer);},[]);

  const refreshWeather=useCallback(async({force=false}={})=>{
    if(!settings.liveWeather){setStatus("disabled");return null;}
    const age=Date.now()-new Date(weather?.fetchedAt||0).getTime();
    if(!force&&weather?.latitude===estateLocation.latitude&&weather?.longitude===estateLocation.longitude&&age<CACHE_MS){setStatus("ready");return weather;}
    if(requestRef.current)return requestRef.current.promise;
    const controller=new AbortController(); const timeout=window.setTimeout(()=>controller.abort(),10000);
    setStatus("loading");setError("");
    const promise=(async()=>{try{
      const fields="temperature_2m,apparent_temperature,precipitation,precipitation_probability,weather_code,cloud_cover,wind_speed_10m,wind_gusts_10m";
      const url=`https://api.open-meteo.com/v1/forecast?latitude=${estateLocation.latitude}&longitude=${estateLocation.longitude}&current=${fields}&daily=sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=1`;
      const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw new Error("Weather service unavailable");
      const next=normalizeOpenMeteoWeather(await response.json(),estateLocation);
      setWeather(next);setStatus("ready");localStorage.setItem("jardinSoleilWeatherCache",JSON.stringify(next));return next;
    }catch(err){if(err.name!=="AbortError"||controller.signal.aborted){setStatus(weather?"cached":"error");setError(weather?"Live weather is temporarily unavailable. Showing the last known estate conditions.":"Live weather is temporarily unavailable.");setWeather((current)=>current?{...current,isStale:true}:current);}return null;
    }finally{window.clearTimeout(timeout);requestRef.current=null;}})();
    requestRef.current={controller,promise};return promise;
  },[estateLocation,settings.liveWeather,weather]);

  useEffect(()=>{refreshWeather();const timer=window.setInterval(()=>refreshWeather(),CACHE_MS);const visible=()=>{if(!document.hidden)refreshWeather();};document.addEventListener("visibilitychange",visible);return()=>{window.clearInterval(timer);document.removeEventListener("visibilitychange",visible);requestRef.current?.controller.abort();};},[refreshWeather]);

  const setManualLocation=async(query)=>{const text=String(query||"").trim();if(!text)return false;setStatus("locating");try{const response=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=1&language=en&format=json`);const place=(await response.json()).results?.[0];if(!place)throw new Error();setEstateLocation({label:[place.name,place.admin1,place.country_code].filter(Boolean).join(", "),latitude:place.latitude,longitude:place.longitude,source:"manual"});setWeather(null);return true;}catch{setError("That location could not be found. Try a city or postal code.");setStatus("error");return false;}};
  const useMyLocation=()=>new Promise((resolve)=>{if(!navigator.geolocation){setError("Choose a location to activate local estate weather.");resolve(false);return;}setStatus("locating");navigator.geolocation.getCurrentPosition((position)=>{setEstateLocation({label:"My local area",latitude:Number(position.coords.latitude.toFixed(2)),longitude:Number(position.coords.longitude.toFixed(2)),source:"geolocation"});setWeather(null);resolve(true);},()=>{setError("Choose a location to activate local estate weather.");setStatus("error");resolve(false);},{timeout:10000,maximumAge:3600000});});
  const updateSetting=(key,value)=>setSettings((current)=>({...current,[key]:value}));
  const resetPreview=()=>setSettings((current)=>({...current,previewCondition:"",previewSeason:""}));
  const liveCondition=weather?.condition||"clear", condition=settings.previewCondition||liveCondition;
  const locationClock=new Date(now);const observedHour=String(weather?.observedAt||"").match(/T(\d\d):(\d\d)/);if(observedHour)locationClock.setHours(Number(observedHour[1]),Number(observedHour[2])+Math.max(0,Math.round((Date.now()-new Date(weather.fetchedAt||Date.now()).getTime())/60000)));
  const season=settings.previewSeason||determineSeason(locationClock,estateLocation.latitude);
  const phase=settings.dayNight?determineDayPhase(locationClock,weather?.sunrise,weather?.sunset):"daytime";
  const windy=Number(weather?.windSpeedMph||0)>=13||condition==="windy";
  const heat=Number(weather?.temperatureF||0)>=90||condition==="hot";
  const buddyMode=condition==="thunderstorm"?"storm":["rain","heavy_rain","drizzle"].includes(condition)?"rain":["snow","heavy_snow","sleet"].includes(condition)?"snow":heat?"heat":windy?"wind":"clear";
  const sourceStatus=settings.previewCondition||settings.previewSeason?"Preview":status==="ready"?"Live":status==="cached"?"Cached":status==="disabled"?"Disabled":"Unavailable";
  const conditionLabel=weatherConditionLabels[condition]||condition;
  const visualWeather={...weather,condition,season,phase,isDaytime:phase!=="night",localHour:locationClock.getHours(),locationLabel:estateLocation.label,isLive:sourceStatus==="Live",isStale:status==="cached"||Boolean(weather?.isStale)};
  const value=useMemo(()=>({settings,updateSetting,weather,visualWeather,status,sourceStatus,estateLocation,error,condition,conditionLabel,windy,heat,buddyMode,phase,season,now,refreshWeather,setManualLocation,useMyLocation,resetPreview}),[settings,weather,status,sourceStatus,estateLocation,error,condition,conditionLabel,windy,heat,buddyMode,phase,season,now,refreshWeather]);
  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}
export const useEstateEnvironment=()=>{const value=React.useContext(EnvironmentContext);if(!value)throw new Error("useEstateEnvironment must be used inside EstateEnvironmentProvider");return value;};
