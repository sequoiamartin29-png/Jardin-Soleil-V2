import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const EnvironmentContext = createContext(null);
const defaultSettings = { liveWeather:true, seasonalEffects:true, wildlife:true, buddy:true, intensity:"Normal" };
const loadJson = (key, fallback) => { try { const value=localStorage.getItem(key); return value?JSON.parse(value):fallback; } catch { return fallback; } };
const estateLocation = { label:"Delaware", latitude:39.0, longitude:-75.5 };
const loadWeather = () => {
  const cached = loadJson("jardinSoleilWeatherCache", null);
  return cached?.locationLabel === estateLocation.label ? cached : null;
};

const conditionFromCode = (code=0) => {
  if ([95,96,99].includes(code)) return "storm";
  if ([71,73,75,77,85,86].includes(code)) return "snow";
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return "rain";
  if ([1,2,3,45,48].includes(code)) return "cloudy";
  return "sunny";
};
const conditionLabel = { sunny:"Sunny", cloudy:"Cloudy", rain:"Rain", storm:"Thunderstorm", snow:"Snow" };
const minutes = (value, fallback) => { if(!value)return fallback; const match=String(value).match(/T(\d\d):(\d\d)/); return match?Number(match[1])*60+Number(match[2]):fallback; };
const phaseFor = (now, sunrise, sunset) => { const current=now.getHours()*60+now.getMinutes(); const rise=minutes(sunrise,420); const set=minutes(sunset,1140); if(current<rise-45||current>=set+90)return "night"; if(current<rise)return "dawn"; if(current<720)return "morning"; if(current<set-90)return "afternoon"; if(current<set)return "golden-hour"; return "evening"; };
const seasonFor = (now, latitude=38) => { const month=now.getMonth()+1; const north=month>=3&&month<=5?"spring":month<=8&&month>=6?"summer":month<=11&&month>=9?"autumn":"winter"; if(latitude>=0)return north; return {spring:"autumn",summer:"winter",autumn:"spring",winter:"summer"}[north]; };

export function EstateEnvironmentProvider({ children }) {
  const [settings,setSettings]=useState(()=>loadJson("jardinSoleilEnvironmentSettings",defaultSettings));
  const [weather,setWeather]=useState(loadWeather);
  const [status,setStatus]=useState("idle");
  const [error,setError]=useState("");
  const [now,setNow]=useState(()=>new Date());

  useEffect(()=>{localStorage.setItem("jardinSoleilEnvironmentSettings",JSON.stringify(settings));},[settings]);
  useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),60000);return()=>window.clearInterval(timer);},[]);
  useEffect(()=>{
    if(!settings.liveWeather){setStatus("disabled");return undefined;}
    let cancelled=false; const controller=new AbortController(); setStatus("loading");
    const refresh=async()=>{
      try {
        const fields="temperature_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m";
        const browserTimeZone=Intl.DateTimeFormat().resolvedOptions().timeZone||"auto";
        const url=`https://api.open-meteo.com/v1/forecast?latitude=${estateLocation.latitude}&longitude=${estateLocation.longitude}&current=${fields}&daily=sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${encodeURIComponent(browserTimeZone)}&forecast_days=1`;
        const response=await fetch(url,{signal:controller.signal}); if(!response.ok)throw new Error("Weather service unavailable"); const data=await response.json();
        const next={ locationLabel:estateLocation.label, latitude:estateLocation.latitude, longitude:estateLocation.longitude, temperature:data.current?.temperature_2m, apparentTemperature:data.current?.apparent_temperature, precipitation:data.current?.precipitation, wind:data.current?.wind_speed_10m, cloudCover:data.current?.cloud_cover, weatherCode:data.current?.weather_code, sunrise:data.daily?.sunrise?.[0], sunset:data.daily?.sunset?.[0], observedAt:data.current?.time, timezone:browserTimeZone };
        if(!cancelled){setWeather(next);setStatus("ready");setError("");localStorage.setItem("jardinSoleilWeatherCache",JSON.stringify(next));}
      } catch(err){if(!cancelled&&err.name!=="AbortError"){setStatus(weather?"cached":"error");setError("Live weather could not be refreshed. Cached conditions remain available when present.");}}
    };refresh();
    return()=>{cancelled=true;controller.abort();};
  },[settings.liveWeather]);

  const state=useMemo(()=>{
    const baseCondition=settings.liveWeather&&weather?conditionFromCode(weather.weatherCode):"sunny";
    const windy=Number(weather?.wind||0)>=15;
    const heat=Number(weather?.temperature||0)>=90;
    const buddyMode=baseCondition==="storm"?"storm":baseCondition==="rain"?"rain":baseCondition==="snow"?"snow":heat?"heat":windy?"wind":"clear";
    return { condition:baseCondition, conditionLabel:conditionLabel[baseCondition], windy, heat, buddyMode, phase:phaseFor(now,weather?.sunrise,weather?.sunset), season:seasonFor(now,weather?.latitude), now };
  },[now,weather,settings.liveWeather]);
  const updateSetting=(key,value)=>setSettings((current)=>({...current,[key]:value}));
  const sourceStatus=status==="ready"?"Live":status==="cached"?"Cached":status==="disabled"?"Manual":"Unavailable";
  return <EnvironmentContext.Provider value={{settings,updateSetting,weather,status,sourceStatus,estateLocation,error,...state}}>{children}</EnvironmentContext.Provider>;
}
export const useEstateEnvironment=()=>{const value=useContext(EnvironmentContext);if(!value)throw new Error("useEstateEnvironment must be used inside EstateEnvironmentProvider");return value;};
