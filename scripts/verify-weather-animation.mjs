import assert from "node:assert/strict";
import {
  ANIMATED_WEATHER_STATES,
  resolveAnimatedWeatherState,
  weatherAnimationMap,
} from "../src/components/weather/weatherAnimationMap.js";

const resolve=(condition,extra={})=>resolveAnimatedWeatherState({condition,phase:"daytime",weatherAvailable:true,...extra});

assert.equal(resolve("clear"),"clear-day");
assert.equal(resolve("clear",{phase:"night",isDaytime:false}),"clear-night");
assert.equal(resolve("partly_cloudy"),"partly-cloudy");
assert.equal(resolve("cloudy"),"cloudy");
assert.equal(resolve("drizzle"),"light-rain");
assert.equal(resolve("rain"),"light-rain");
assert.equal(resolve("heavy_rain"),"heavy-rain");
assert.equal(resolve("thunderstorm"),"thunderstorm");
assert.equal(resolve("snow"),"snow");
assert.equal(resolve("heavy_snow"),"snow");
assert.equal(resolve("sleet"),"snow");
assert.equal(resolve("fog"),"fog");
assert.equal(resolve("windy"),"windy");
assert.equal(resolve("clear",{temperatureF:96}),"hot");
assert.equal(resolve("clear",{temperatureF:27}),"cold");
assert.equal(resolve("clear",{windSpeedMph:25}),"windy");
assert.equal(resolve("not-a-real-code"),"unknown");
assert.equal(resolveAnimatedWeatherState({condition:"rain",weatherAvailable:false}),"unknown");

for(const state of ANIMATED_WEATHER_STATES){
  assert.ok(weatherAnimationMap[state],`Missing animation configuration for ${state}`);
}

assert.equal(weatherAnimationMap.thunderstorm.lightning,true);
assert.ok(weatherAnimationMap["heavy-rain"].rain>weatherAnimationMap["light-rain"].rain);
assert.ok(weatherAnimationMap.snow.snow>0);
assert.equal(weatherAnimationMap.unknown.rain,0);

console.log("PASS · Weather codes normalize to safe, data-driven animation states.");
