const DAY_MS=24*60*60*1000;

const asText=(value)=>String(value||"").trim();
const lower=(value)=>asText(value).toLocaleLowerCase();
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
const formatRain=(amount)=>amount>=0.01?`${amount.toFixed(amount>=1?1:2)} in`:`${Math.round(amount*100)} hundredths of an inch`;

const moistureProfiles=[
  { pattern:/lavender|rosemary|thyme|sage|succulent|sedum|cactus/, preference:"Dry between waterings", interval:5, demand:-2 },
  { pattern:/blueberr|strawberr|mint|basil|hydrangea|fern|seedling|lettuce/, preference:"Consistently moist", interval:1, demand:2 },
  { pattern:/tomato|pepper|cucumber|squash|melon|container/, preference:"Even moisture", interval:2, demand:1 },
];

const resolveMoistureProfile=(plant)=>{
  const explicit=lower(plant.moisturePreference||plant.waterPreference||plant.wateringNeeds);
  if(explicit.includes("dry"))return{preference:asText(plant.moisturePreference||plant.waterPreference),interval:5,demand:-2};
  if(explicit.includes("moist")||explicit.includes("high"))return{preference:asText(plant.moisturePreference||plant.waterPreference),interval:1,demand:2};
  const identity=lower(`${plant.commonName} ${plant.name} ${plant.type} ${plant.variety} ${plant.category}`);
  return moistureProfiles.find((profile)=>profile.pattern.test(identity))||{preference:"Moderate, even moisture",interval:3,demand:0};
};

const isWateringRecord=(record)=>/water|irrigat|soak|drink/i.test(`${record.type||""} ${record.title||""} ${record.action||""} ${record.lastCareType||""}`);

const recordTargetsPlant=(record,plant)=>{
  if(record.plantId===plant.id||record.linkedPlantId===plant.id)return true;
  if(record.affectedPlantIds?.includes(plant.id)||record.targetIds?.includes(plant.id))return true;
  return Boolean(record.gardenZone&&plant.gardenZone&&lower(record.gardenZone)===lower(plant.gardenZone));
};

const toTimestamp=(value)=>{
  const timestamp=new Date(value||0).getTime();
  return Number.isFinite(timestamp)?timestamp:0;
};

export const findLastWateredAt=(plant,journalEntries=[],now=new Date())=>{
  const candidates=[];
  if(/water|irrigat|soak/i.test(plant.lastCareType||""))candidates.push(plant.lastCareAt);
  candidates.push(plant.lastWateredAt,plant.lastWateringAt);
  journalEntries.forEach((entry)=>{
    if(isWateringRecord(entry)&&recordTargetsPlant(entry,plant))candidates.push(entry.createdAt||entry.date);
  });
  const timestamp=Math.max(0,...candidates.map(toTimestamp).filter((value)=>value<=now.getTime()));
  return timestamp?new Date(timestamp).toISOString():"";
};

const daysSince=(date,now)=>date?Math.max(0,(now.getTime()-new Date(date).getTime())/DAY_MS):null;

const zoneForPlant=(plant,zones)=>zones.find((zone)=>zone.id===plant.zoneId||lower(zone.name)===lower(plant.gardenZone));

const isContainerPlant=(plant,zone)=>/container|pot|planter|hanging basket/i.test(`${plant.growingMethod||""} ${plant.location||""} ${plant.container||""} ${zone?.type||""}`);

const exposureBoost=(plant,zone)=>/full sun|south|west/i.test(`${plant.sunExposure||""} ${plant.sunlight||""} ${zone?.sunlight||""}`)?1:0;

const weatherFactors=(weather,day)=>{
  const temperature=finite(day?.temperatureHighF,finite(weather?.temperatureF,72));
  const humidity=finite(day?.humidity,finite(weather?.humidity,55));
  const wind=finite(day?.windSpeedMph,finite(weather?.windSpeedMph,0));
  const rain=finite(day?.precipitation,finite(weather?.precipitation,0));
  const rainChance=finite(day?.precipitationProbability,finite(weather?.precipitationProbability,0));
  return {temperature,humidity,wind,rain,rainChance};
};

const growingConditions=(factors)=>{
  if(factors.temperature<=36)return{label:"Cold & resting",detail:"Cool soil is holding moisture longer.",tone:"cold"};
  if(factors.rain>=.2||factors.rainChance>=70)return{label:"Rain-supported",detail:"Natural rainfall should do much of today’s work.",tone:"rain"};
  if(factors.temperature>=90)return{label:"Hot & thirsty",detail:"Heat will draw moisture quickly, especially from containers.",tone:"hot"};
  if(factors.humidity>=70)return{label:"Humid & gentle",detail:"Moist air is slowing water loss from leaves and soil.",tone:"humid"};
  if(factors.wind>=16)return{label:"Breezy & drying",detail:"Wind may dry exposed leaves and containers sooner.",tone:"wind"};
  return{label:"Balanced growing weather",detail:"Conditions are comfortable for steady garden growth.",tone:"balanced"};
};

const confidenceFor=(weather,hasHistory)=>{
  if(!weather)return{label:"Garden-only guidance",value:52};
  const stalePenalty=weather.isStale?18:0;
  const historyBonus=hasHistory?7:0;
  const forecastBonus=weather.forecast?.length?5:0;
  const value=clamp(78-stalePenalty+historyBonus+forecastBonus,45,94);
  return{label:value>=85?"High confidence":value>=68?"Good confidence":"Early estimate",value};
};

const soilEstimate=(factors,averageDemand,knownHistory)=>{
  if(factors.rain>=.25)return"Moist to wet";
  if(factors.temperature>=90&&factors.humidity<50)return averageDemand>0?"Drying quickly":"Dry at the surface";
  if(!knownHistory)return"Moisture check recommended";
  if(averageDemand>=2)return"Likely dry";
  if(averageDemand<=-1)return"Likely holding moisture";
  return"Moderately moist";
};

const actionForPlant=({plant,zone,profile,lastWateredAt,factors,now})=>{
  const container=isContainerPlant(plant,zone);
  const seedling=/seed|seedling|new transplant/i.test(`${plant.plantingMethod||""} ${plant.age||""} ${plant.status||""}`);
  const elapsed=daysSince(lastWateredAt,now);
  const due=elapsed===null?1:elapsed/profile.interval;
  let demand=profile.demand+due+exposureBoost(plant,zone)+(container?1.5:0)+(seedling?1.5:0);
  if(factors.temperature>=88)demand+=2;
  if(factors.temperature<=40)demand-=4;
  if(factors.humidity>=72)demand-=1;
  if(factors.humidity<=38)demand+=1;
  if(factors.wind>=16)demand+=1;
  if(factors.rain>=.18||factors.rainChance>=70)demand-=4;

  let recommendation;
  let detail;
  let urgency="wait";
  if(factors.temperature<=36){recommendation="No watering needed today";detail="Cold soil will hold its moisture.";}
  else if(factors.rain>=.18||factors.rainChance>=70){recommendation="Skip watering today";detail="Expected rain should provide a gentle soak.";}
  else if(container&&factors.temperature>=94){recommendation="Water morning and evening";detail="Containers lose moisture quickly in this heat.";urgency="high";}
  else if(seedling&&demand>=3){recommendation="Keep gently moist this afternoon";detail="Young roots appreciate steady, light moisture.";urgency="high";}
  else if(demand>=4){recommendation=container?"Water thoroughly this evening":"Water deeply this evening";detail="A slow soak will reach the active root zone.";urgency="high";}
  else if(demand>=2.3){recommendation="Water lightly this afternoon";detail="A small drink should keep moisture comfortably even.";urgency="medium";}
  else if(profile.demand>=2){recommendation="Moist soil is ideal today";detail="Check the top inch and water only if it feels dry.";urgency="medium";}
  else{recommendation="Let the soil rest today";detail="It should be comfortable waiting until tomorrow.";}

  return{
    plantId:plant.id,
    name:plant.nickname||plant.name||plant.commonName||"Garden plant",
    botanicalName:plant.botanicalName||plant.variety||plant.commonName||"",
    gardenZone:plant.gardenZone||zone?.name||plant.location||"Garden",
    moisturePreference:profile.preference,
    lastWateredAt,
    recommendation,
    detail,
    urgency,
    demand,
    photoUrl:plant.photoUrl||plant.imageUrl||"",
  };
};

const mainRecommendation=(plantRecommendations,factors,confidence)=>{
  const thirsty=plantRecommendations.filter((item)=>item.urgency==="high");
  const seedlings=plantRecommendations.filter((item)=>/seed|young roots/i.test(`${item.recommendation} ${item.detail}`));
  const containers=plantRecommendations.filter((item)=>/morning and evening/i.test(item.recommendation));
  if(factors.temperature<=36)return{icon:"❄",title:"No watering necessary today.",reason:"Cold conditions are helping the soil hold moisture. Your garden can rest.",tone:"cold",expression:"happy"};
  if(factors.rain>=.18||factors.rainChance>=70)return{icon:"☂",title:"Skip watering today.",reason:`Rain has a ${Math.round(factors.rainChance)}% chance of arriving, so nature can take today’s turn.`,tone:"rain",expression:"checking-weather"};
  if(containers.length)return{icon:"☀",title:"Water containers twice today.",reason:"Hot conditions will dry small soil volumes quickly. A morning drink and evening check will keep roots comfortable.",tone:"hot",expression:"concerned"};
  if(seedlings.length)return{icon:"🌱",title:"Seedlings need moisture this afternoon.",reason:"Young roots are the most sensitive part of today’s garden. Keep their soil gently, evenly moist.",tone:"seedling",expression:"watering"};
  if(thirsty.length)return{icon:"✓",title:"Water deeply this evening.",reason:`${thirsty.length===1?thirsty[0].name:`${thirsty.length} plants`} will benefit most after the strongest sun has passed.`,tone:"water",expression:"watering"};
  return{icon:"✓",title:"Your garden can take it easy today.",reason:"Most plants have enough moisture to wait. A calm visual check is all that’s needed.",tone:"rest",expression:"happy",confidence};
};

const adviceFor=(plantRecommendations,factors)=>{
  const resting=plantRecommendations.find((item)=>item.urgency==="wait");
  const thirsty=plantRecommendations.find((item)=>item.urgency==="high");
  const moist=plantRecommendations.find((item)=>/moist soil/i.test(item.recommendation));
  const tips=[];
  if(factors.rain>=.08)tips.push("Recent rain is giving your garden a helpful head start.");
  if(factors.humidity>=65)tips.push(`Today’s humidity means ${moist?.name||"tender leaves"} will stay happy a little longer.`);
  if(resting)tips.push(`${resting.name} can safely wait until tomorrow.`);
  if(thirsty)tips.push(`${thirsty.name} will appreciate a slow drink once the day begins to cool.`);
  if(!tips.length)tips.push("A finger pressed into the top inch of soil is still one of the kindest, smartest moisture checks.");
  return tips.slice(0,3);
};

const generalDayGuidance=(day,weather,index)=>{
  const factors=weatherFactors(weather,day);
  const label=index===0?"Today":index===1?"Tomorrow":new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined,{weekday:"short"});
  if(factors.temperature<=36)return{guidance:"Let the garden rest",detail:"Cold soil will retain moisture."};
  if(factors.rain>=.18||factors.rainChance>=70)return{guidance:"Rain will lend a hand",detail:"Plan to skip routine watering."};
  if(factors.temperature>=92)return{guidance:"Check containers twice",detail:"Water early, then check again near sunset."};
  if(factors.wind>=17)return{guidance:"Watch exposed pots",detail:"Wind may dry them faster than expected."};
  return{guidance:index===0?"Follow today’s plant plan":"A gentle moisture check",detail:"Water only the plants whose soil feels dry.",label};
};

/**
 * Pure recommendation boundary for the Watering Wizard.
 * It accepts normalized provider data and garden records, and performs no I/O.
 */
export const buildWateringPlan=({weather,plants=[],zones=[],journalEntries=[],photos=[],now=new Date()}={})=>{
  const forecast=weather?.forecast?.length?weather.forecast:[weather?{
    date:now.toISOString().slice(0,10),
    condition:weather.condition,
    conditionLabel:weather.conditionLabel,
    temperatureHighF:weather.temperatureF,
    temperatureLowF:weather.temperatureF,
    precipitation:weather.precipitation,
    precipitationProbability:weather.precipitationProbability,
    windSpeedMph:weather.windSpeedMph,
    sunrise:weather.sunrise,
    sunset:weather.sunset,
  }:null].filter(Boolean);
  const today=forecast[0]||null;
  const factors=weatherFactors(weather,today);
  const photoFor=(plant)=>photos.find((photo)=>photo.plantId===plant.id||photo.linkedPlantId===plant.id);
  const plantRecommendations=plants.map((plant)=>{
    const zone=zoneForPlant(plant,zones);
    const lastWateredAt=findLastWateredAt(plant,journalEntries,now);
    const recommendation=actionForPlant({plant,zone,profile:resolveMoistureProfile(plant),lastWateredAt,factors,now});
    if(!weather){
      recommendation.recommendation="Check soil moisture";
      recommendation.detail="Local weather will turn this into a precise watering time.";
      recommendation.urgency="wait";
    }
    recommendation.photoUrl=recommendation.photoUrl||photoFor(plant)?.url||photoFor(plant)?.src||"";
    return recommendation;
  }).sort((a,b)=>b.demand-a.demand||a.name.localeCompare(b.name));
  const knownHistory=plantRecommendations.some((item)=>item.lastWateredAt);
  const confidence=confidenceFor(weather,knownHistory);
  const primary=weather?mainRecommendation(plantRecommendations,factors,confidence):{
    icon:"✦",
    title:"Connect local weather to begin today’s plan.",
    reason:"Once local conditions are ready, the Wizard can combine them with your plants and care history without guessing.",
    tone:"waiting",
    expression:"checking-weather",
  };
  const averageDemand=plantRecommendations.length?plantRecommendations.reduce((sum,item)=>sum+item.demand,0)/plantRecommendations.length:0;
  return{
    generatedAt:now.toISOString(),
    primary:{
      ...primary,
      confidence,
      estimatedSoilCondition:soilEstimate(factors,averageDemand,knownHistory),
      expectedRainfall:weather?`${formatRain(factors.rain)} · ${Math.round(factors.rainChance)}% chance`:"Weather connection needed",
    },
    factors,
    growingConditions:weather?growingConditions(factors):{label:"Waiting for weather",detail:"Connect local conditions for a garden-specific reading.",tone:"waiting"},
    plantRecommendations,
    advice:weather?adviceFor(plantRecommendations,factors):["Connect local weather when you’re ready, and I’ll make today’s plan personal to your garden."],
    outlook:forecast.slice(0,7).map((day,index)=>({
      ...day,
      ...generalDayGuidance(day,weather,index),
      label:index===0?"Today":index===1?"Tomorrow":new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined,{weekday:"short"}),
    })),
  };
};

export const wateringEngine={buildPlan:buildWateringPlan};
