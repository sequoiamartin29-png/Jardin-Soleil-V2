import assert from "node:assert/strict";
import { buildWateringPlan, findLastWateredAt } from "../src/services/watering-engine.js";
import { normalizeOpenMeteoWeather } from "../src/utils/normalizeWeather.js";

const now=new Date("2026-08-01T12:00:00.000Z");
const tomato={id:"tomato",name:"Tomatoes",commonName:"Tomato",category:"Vegetables",gardenZone:"Kitchen Beds",lastCareType:"Watering",lastCareAt:"2026-07-29T12:00:00.000Z"};
const basil={id:"basil",name:"Basil",commonName:"Basil",category:"Herbs",gardenZone:"Terrace"};
const zones=[{id:"beds",name:"Kitchen Beds",type:"Raised bed",sunlight:"Full sun"},{id:"terrace",name:"Terrace",type:"Container garden",sunlight:"Full sun"}];

const day=(overrides={})=>({date:"2026-08-01",condition:"clear",conditionLabel:"Clear",temperatureHighF:82,temperatureLowF:64,precipitation:0,precipitationProbability:5,windSpeedMph:5,sunrise:"2026-08-01T06:00",sunset:"2026-08-01T20:15",...overrides});
const weather=(overrides={})=>({temperatureF:80,humidity:48,windSpeedMph:5,windGustMph:8,precipitation:0,precipitationProbability:5,isStale:false,forecast:[day(),...Array.from({length:6},(_,index)=>day({date:`2026-08-0${index+2}`}))],...overrides});

const rainPlan=buildWateringPlan({weather:weather({forecast:[day({precipitation:.42,precipitationProbability:88})]}),plants:[tomato,basil],zones,now});
assert.equal(rainPlan.primary.title,"Skip watering today.");
assert.equal(rainPlan.plantRecommendations.every((item)=>item.recommendation==="Skip watering today"),true);

const hotPlan=buildWateringPlan({weather:weather({temperatureF:96,humidity:31,forecast:[day({temperatureHighF:98})]}),plants:[basil],zones,now});
assert.equal(hotPlan.primary.title,"Water containers twice today.");
assert.equal(hotPlan.plantRecommendations[0].recommendation,"Water morning and evening");

const coldPlan=buildWateringPlan({weather:weather({temperatureF:30,forecast:[day({temperatureHighF:34,temperatureLowF:22})]}),plants:[tomato],zones,now});
assert.equal(coldPlan.primary.title,"No watering necessary today.");

const historyDate=findLastWateredAt(tomato,[{id:"water-log",plantId:"tomato",type:"Watering",date:"2026-07-31"}],now);
assert.equal(historyDate.startsWith("2026-07-31"),true);

const weekPlan=buildWateringPlan({weather:weather(),plants:[tomato],zones,now});
assert.equal(weekPlan.outlook.length,7);
assert.equal(weekPlan.primary.confidence.value>=85,true);

const waitingPlan=buildWateringPlan({weather:null,plants:[tomato],zones,now});
assert.match(waitingPlan.primary.title,/Connect local weather/);
assert.equal(waitingPlan.plantRecommendations[0].recommendation,"Check soil moisture");

const normalized=normalizeOpenMeteoWeather({
  current:{time:"2026-08-01T12:00",temperature_2m:84,apparent_temperature:86,relative_humidity_2m:61,precipitation:0,precipitation_probability:12,weather_code:1,cloud_cover:22,wind_speed_10m:7,wind_gusts_10m:11},
  daily:{time:["2026-08-01"],weather_code:[1],temperature_2m_max:[88],temperature_2m_min:[66],precipitation_sum:[.04],precipitation_probability_max:[18],sunrise:["2026-08-01T06:00"],sunset:["2026-08-01T20:10"],wind_speed_10m_max:[9],wind_gusts_10m_max:[14]},
  timezone:"America/New_York",
},{label:"Test Garden",latitude:40,longitude:-74},now);
assert.equal(normalized.humidity,61);
assert.equal(normalized.forecast.length,1);
assert.equal(normalized.forecast[0].temperatureHighF,88);

console.log("PASS · Watering Wizard handles rain, heat, cold, history, missing weather, and normalized forecasts.");
