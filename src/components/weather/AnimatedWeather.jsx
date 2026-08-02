import React from "react";
import useWeatherAnimation from "./useWeatherAnimation";
import "./AnimatedWeather.css";

export function WeatherAtmosphere({ config,state }){
  return <>
    <span className={`js-weather-atmosphere is-${config.atmosphere}`} />
    {state==="clear-day"&&<span className="js-weather-sunlight" />}
    {state==="clear-night"&&<div className="js-weather-night"><span className="js-weather-stars"/><span className="js-weather-moon"/></div>}
    {config.heat&&<span className="js-weather-heat" />}
    {config.frost&&<span className="js-weather-frost" />}
  </>;
}

export function WeatherClouds({ count=0 }){
  if(!count)return null;
  return <div className="js-weather-clouds">{Array.from({length:count},(_,index)=><span key={index} style={{"--weather-top":`${10+index*10}%`,"--weather-delay":`${-index*15}s`,"--weather-scale":1-index*.12}}/>)}</div>;
}

export function WeatherRain({ count=0,heavy=false }){
  if(!count)return null;
  return <div className={`js-weather-rain${heavy?" is-heavy":""}`}>{Array.from({length:count},(_,index)=><i key={index} style={{"--weather-left":`${2+index*4.2}%`,"--weather-delay":`${-(index%5)*.22}s`}}/>)}</div>;
}

export function WeatherSnow({ count=0 }){
  if(!count)return null;
  return <div className="js-weather-snow">{Array.from({length:count},(_,index)=><i key={index} style={{"--weather-left":`${3+index*5.8}%`,"--weather-delay":`${-(index%6)*1.4}s`,"--weather-scale":index%2?.62:.9}}/>)}</div>;
}

export function WeatherMist(){
  return <div className="js-weather-mist"><span/><span/></div>;
}

export function WeatherWind({ ambient=false }){
  const count=ambient?3:7;
  return <div className={`js-weather-wind${ambient?" is-ambient":""}`}>{Array.from({length:count},(_,index)=><i key={index} style={{"--weather-left":`${4+index*13}%`,"--weather-delay":`${-index*2.1}s`}}/>)}</div>;
}

export function WeatherParticles({ config,state,reducedMotion }){
  if(reducedMotion)return null;
  const heavy=["heavy-rain","thunderstorm"].includes(state);
  return <>
    <WeatherClouds count={config.clouds}/>
    <WeatherRain count={config.rain} heavy={heavy}/>
    <WeatherSnow count={config.snow}/>
    {config.mist&&<WeatherMist/>}
    {config.wind&&<WeatherWind ambient={config.wind==="ambient"}/>}
    {config.lightning&&<span className="js-weather-lightning"/>}
  </>;
}

export default function AnimatedWeather({ paused=false,enabled=true,surface="garden",className="" }){
  const animation=useWeatherAnimation({paused,enabled});
  const {state,config,phase,season,windy,reducedMotion,quality,disabled}=animation;
  return <div
    className={`js-animated-weather js-animated-weather--${surface} weather-state-${state} phase-${phase} season-${season}${windy?" is-windy":""}${paused?" is-paused":""}${reducedMotion?" is-reduced-motion":""} quality-${quality} ${className}`.trim()}
    data-weather-state={state}
    data-weather-surface={surface}
    data-reduced-motion={reducedMotion?"true":"false"}
    data-weather-disabled={disabled?"true":"false"}
    aria-hidden="true"
  >
    <WeatherAtmosphere config={config} state={state}/>
    <WeatherParticles config={config} state={state} reducedMotion={reducedMotion}/>
  </div>;
}
