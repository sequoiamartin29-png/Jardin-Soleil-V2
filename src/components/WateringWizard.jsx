import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  BellRing,
  Check,
  CloudRain,
  CloudSun,
  Droplets,
  Gauge,
  Leaf,
  MapPin,
  RefreshCw,
  Sparkles,
  Sprout,
  Sunrise,
  Sunset,
  ThermometerSun,
  Wind,
} from "lucide-react";
import { useGarden } from "../context/GardenContext";
import { useEstateEnvironment } from "../context/EstateEnvironmentContext";
import { buildWateringPlan } from "../services/watering-engine";
import WateringWizardCharacter from "./wateringWizard/WateringWizardCharacter";
import "./WateringWizard.css";

const NOTIFICATION_KEY="jardinSoleilWateringNotifications";
const tabs=[
  {id:"today",label:"Today’s Plan"},
  {id:"tomorrow",label:"Tomorrow"},
  {id:"week",label:"7 Day Outlook"},
];

const readNotificationPreference=()=>{try{return localStorage.getItem(NOTIFICATION_KEY)==="true";}catch{return false;}};
const displayNumber=(value,suffix="")=>Number.isFinite(Number(value))?`${Math.round(Number(value))}${suffix}`:"—";
const formatClock=(value)=>{if(!value)return"—";const parsed=new Date(value);return Number.isNaN(parsed.getTime())?"—":parsed.toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"});};
const formatLastWatered=(value)=>{
  if(!value)return"No watering logged yet";
  const days=Math.max(0,Math.floor((Date.now()-new Date(value).getTime())/(24*60*60*1000)));
  if(days===0)return"Today";
  if(days===1)return"Yesterday";
  return `${days} days ago`;
};
const dayDate=(date)=>date?new Date(`${date}T12:00:00`).toLocaleDateString(undefined,{month:"short",day:"numeric"}):"";
const greetingFor=(date)=>date.getHours()<12?"Good morning":date.getHours()<18?"Good afternoon":"Good evening";

function WeatherMetric({icon:Icon,label,value,detail}){
  return <article className="js-watering-weather-metric">
    <span aria-hidden="true"><Icon size={18}/></span>
    <div><small>{label}</small><strong>{value}</strong>{detail&&<em>{detail}</em>}</div>
  </article>;
}

function OutlookCard({day,index}){
  return <motion.article className="js-watering-outlook-card" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{type:"spring",stiffness:170,damping:20,delay:index*.035}}>
    <header><div><strong>{day.label}</strong><span>{dayDate(day.date)}</span></div><b>{displayNumber(day.temperatureHighF,"°")}</b></header>
    <div className="js-watering-outlook-card__weather"><CloudRain size={16}/><span>{day.conditionLabel||"Forecast"}</span><small>{displayNumber(day.precipitationProbability,"% rain")}</small></div>
    <h3>{day.guidance}</h3>
    <p>{day.detail}</p>
  </motion.article>;
}

function PlantRecommendation({item,index}){
  const reduceMotion=useReducedMotion();
  return <motion.article
    className={`js-watering-plant-card is-${item.urgency}`}
    initial={reduceMotion?false:{opacity:0,y:10}}
    whileInView={{opacity:1,y:0}}
    viewport={{once:true,amount:.2}}
    transition={{type:"spring",stiffness:150,damping:21,delay:Math.min(index,6)*.035}}
  >
    <div className="js-watering-plant-card__photo">
      {item.photoUrl?<img src={item.photoUrl} alt={`${item.name} in the garden`}/>:<span aria-hidden="true"><Leaf size={25}/></span>}
    </div>
    <div className="js-watering-plant-card__identity"><h3>{item.name}</h3><p>{item.botanicalName}</p><span><MapPin size={12}/>{item.gardenZone}</span></div>
    <dl><div><dt>Last watered</dt><dd>{formatLastWatered(item.lastWateredAt)}</dd></div><div><dt>Prefers</dt><dd>{item.moisturePreference}</dd></div></dl>
    <div className="js-watering-plant-card__action"><span aria-hidden="true"><Droplets size={18}/></span><div><strong>{item.recommendation}</strong><p>{item.detail}</p></div></div>
  </motion.article>;
}

export default function WateringWizard(){
  const {gardenProfile,activePlants,gardenZones,journalEntries,photos}=useGarden();
  const environment=useEstateEnvironment();
  const {weather,status,sourceStatus,estateLocation,error,conditionLabel,refreshWeather,useMyLocation}=environment;
  const [activeTab,setActiveTab]=useState("today");
  const [notificationsEnabled,setNotificationsEnabled]=useState(readNotificationPreference);
  const [notificationMessage,setNotificationMessage]=useState("");
  const [celebrating,setCelebrating]=useState(false);
  const now=environment.now||new Date();
  const plan=useMemo(()=>buildWateringPlan({weather,plants:activePlants,zones:gardenZones,journalEntries,photos,now}),[weather,activePlants,gardenZones,journalEntries,photos,now]);
  const gardenerName=gardenProfile.ownerDisplayName||gardenProfile.gardenName||"Gardener";
  const weatherReady=Boolean(weather);
  const priorityPlant=plan.plantRecommendations.find((item)=>item.urgency==="high")||plan.plantRecommendations[0];
  const notificationPreview=plan.primary.tone==="rain"
    ? "🌧 Rain is on the way. Skip routine watering today."
    : plan.primary.tone==="hot"
      ? "☀ Hot afternoon expected. Check container plants this evening."
      : priorityPlant
        ? `🌿 Good morning! ${priorityPlant.name} ${priorityPlant.urgency==="high"?"would love a deep watering today":"can follow today’s gentle garden plan"}.`
        : "🌿 Good morning! Your garden plan is ready whenever you are.";

  useEffect(()=>{
    if(!celebrating)return undefined;
    const timer=window.setTimeout(()=>setCelebrating(false),2200);
    return()=>window.clearTimeout(timer);
  },[celebrating]);

  const toggleNotifications=async()=>{
    if(notificationsEnabled){
      setNotificationsEnabled(false);
      setNotificationMessage("Watering reminders are paused. Your plan will still be here whenever you visit.");
      try{localStorage.setItem(NOTIFICATION_KEY,"false");}catch{/* preference remains in memory */}
      return;
    }
    if("Notification" in globalThis&&globalThis.Notification.permission!=="granted"){
      try{
        const permission=await globalThis.Notification.requestPermission();
        if(permission!=="granted"){
          setNotificationMessage("No problem—reminders will stay off, and the Wizard will keep your plan ready here.");
          return;
        }
      }catch{
        setNotificationMessage("No problem—this device can keep reminders off while your plan stays ready here.");
        return;
      }
    }
    setNotificationsEnabled(true);
    setCelebrating(true);
    setNotificationMessage("Morning watering guidance is ready for this device.");
    try{localStorage.setItem(NOTIFICATION_KEY,"true");}catch{/* preference remains in memory */}
  };

  const expression=celebrating?"celebrating":status==="loading"||status==="locating"?"checking-weather":activeTab==="tomorrow"?"thinking":activeTab==="week"?"excited":plan.primary.expression||"happy";
  const visibleOutlook=activeTab==="today"?plan.outlook.slice(0,1):activeTab==="tomorrow"?plan.outlook.slice(1,2):plan.outlook;
  const temperature=weather?.temperatureF;
  const primary=weatherReady?plan.primary:{
    icon:"✦",
    title:"Let’s connect your local weather.",
    reason:"Once your location is ready, I’ll blend the forecast with your plants and recent garden care—without guessing.",
    confidence:{label:"Waiting for local conditions",value:0},
    estimatedSoilCondition:"A quick touch test is best for now",
    expectedRainfall:"Waiting for forecast",
    tone:"waiting",
  };

  return <section className="js-watering-wizard" aria-labelledby="watering-wizard-title">
    <header className="js-watering-hero">
      <div className="js-watering-hero__copy">
        <p><Sparkles size={14}/> Jardin Soleil · Watering Wizard</p>
        <h1 id="watering-wizard-title">{greetingFor(now)}, {gardenerName}!</h1>
        <span>Let’s make today a great day for your garden.</span>
        <div className="js-watering-hero__location"><MapPin size={14}/><span>{estateLocation.label}</span><b>{sourceStatus}</b></div>
      </div>
      <div className="js-watering-hero__character"><WateringWizardCharacter expression={expression} size="medium"/></div>
      <div className="js-watering-hero__quote"><Droplets size={18}/><p>{plan.advice[0]}</p></div>
    </header>

    <section className="js-watering-weather" aria-labelledby="current-weather-title">
      <header><div><p>Right now</p><h2 id="current-weather-title">Current Weather</h2></div><button className="js-watering-refresh" type="button" onClick={()=>refreshWeather({force:true})} disabled={status==="loading"||status==="locating"}><RefreshCw size={15} className={status==="loading"?"is-spinning":""}/>{status==="loading"?"Checking…":"Refresh"}</button></header>
      {!weatherReady&&<div className="js-watering-weather__setup" role="status"><CloudSun size={28}/><div><strong>Local conditions are waiting.</strong><p>Use the same location permission as Estate Weather to create a precise, personal plan.</p>{error&&<span>{error}</span>}</div><button className="js-watering-location" type="button" onClick={useMyLocation}><MapPin size={15}/> Use My Location</button></div>}
      <div className="js-watering-weather__grid">
        <WeatherMetric icon={CloudSun} label="Current weather" value={weatherReady?conditionLabel:"—"} detail={weather?.isStale?"Last known conditions":""}/>
        <WeatherMetric icon={ThermometerSun} label="Temperature" value={displayNumber(temperature,"°F")} detail={Number.isFinite(Number(weather?.apparentTemperatureF))?`Feels like ${displayNumber(weather.apparentTemperatureF,"°")}`:""}/>
        <WeatherMetric icon={Gauge} label="Humidity" value={displayNumber(weather?.humidity,"%")} />
        <WeatherMetric icon={Wind} label="Wind" value={displayNumber(weather?.windSpeedMph," mph")} detail={Number(weather?.windGustMph)>weather?.windSpeedMph?`Gusts ${displayNumber(weather.windGustMph," mph")}`:""}/>
        <WeatherMetric icon={CloudRain} label="Chance of rain" value={displayNumber(weather?.precipitationProbability,"%")} />
        <WeatherMetric icon={Sunrise} label="Sunrise" value={formatClock(weather?.sunrise)} />
        <WeatherMetric icon={Sunset} label="Sunset" value={formatClock(weather?.sunset)} />
        <WeatherMetric icon={Sprout} label="Growing conditions" value={weatherReady?plan.growingConditions.label:"Waiting for weather"} detail={weatherReady?plan.growingConditions.detail:""}/>
      </div>
    </section>

    <motion.section className={`js-watering-primary is-${primary.tone}`} aria-labelledby="watering-recommendation-title" layout transition={{type:"spring",stiffness:150,damping:22}}>
      <div className="js-watering-primary__seal" aria-hidden="true">{primary.icon}</div>
      <div className="js-watering-primary__message"><p>Today’s best next step</p><h2 id="watering-recommendation-title">{primary.title}</h2><span>{primary.reason}</span></div>
      <div className="js-watering-primary__facts">
        <div><span>Confidence</span><strong>{primary.confidence.label}</strong>{weatherReady&&<i><b style={{width:`${primary.confidence.value}%`}}/></i>}</div>
        <div><span>Estimated soil</span><strong>{primary.estimatedSoilCondition}</strong></div>
        <div><span>Expected rainfall</span><strong>{primary.expectedRainfall}</strong></div>
      </div>
    </motion.section>

    <section className="js-watering-plan" aria-labelledby="watering-plan-title">
      <header className="js-watering-section-heading"><div><p>Your gentle rhythm</p><h2 id="watering-plan-title">Today & Ahead</h2></div><span>{plan.outlook.length?"A calm look at the week":"Forecast will appear when weather connects"}</span></header>
      <div className="js-watering-tabs" role="tablist" aria-label="Watering plan period">
        {tabs.map((tab)=><button className="js-watering-tab" key={tab.id} id={`watering-tab-${tab.id}`} type="button" role="tab" aria-selected={activeTab===tab.id} aria-controls="watering-outlook-panel" tabIndex={activeTab===tab.id?0:-1} onClick={()=>setActiveTab(tab.id)}>{tab.label}</button>)}
      </div>
      <AnimatePresence mode="wait">
        <motion.div id="watering-outlook-panel" className="js-watering-outlook" role="tabpanel" aria-labelledby={`watering-tab-${activeTab}`} key={activeTab} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-8}} transition={{duration:.18}}>
          {visibleOutlook.length?visibleOutlook.map((day,index)=><OutlookCard key={day.date||index} day={day} index={index}/>):<p className="js-watering-empty">The forecast will settle here as soon as local weather is connected.</p>}
        </motion.div>
      </AnimatePresence>
    </section>

    <section className="js-watering-plants" aria-labelledby="plant-watering-title">
      <header className="js-watering-section-heading"><div><p>Plant by plant</p><h2 id="plant-watering-title">Personal Recommendations</h2></div><span>{plan.plantRecommendations.length} {plan.plantRecommendations.length===1?"plant":"plants"} considered</span></header>
      {plan.plantRecommendations.length?<div className="js-watering-plants__grid">{plan.plantRecommendations.map((item,index)=><PlantRecommendation item={item} index={index} key={item.plantId}/>)}</div>:<div className="js-watering-empty"><Sprout size={24}/><p>Add your first plant and the Wizard will begin learning its watering rhythm.</p></div>}
    </section>

    <div className="js-watering-lower-grid">
      <section className="js-watering-advice" aria-labelledby="wizard-advice-title"><header><span><Sparkles size={18}/></span><div><p>A note from your Wizard</p><h2 id="wizard-advice-title">Garden wisdom for today</h2></div></header><ul>{plan.advice.map((tip,index)=><li key={tip}><Check size={16}/><span>{tip}</span>{index===0&&<small>Just for today</small>}</li>)}</ul></section>
      <section className="js-watering-notifications" aria-labelledby="watering-notifications-title"><header><span>{notificationsEnabled?<BellRing size={22}/>:<Bell size={22}/>}</span><div><p>Gentle reminders</p><h2 id="watering-notifications-title">Watering notifications</h2></div></header><p>{notificationsEnabled?"Your morning plan and important weather changes can find you at the right moment.":"Choose calm, useful nudges for thirsty plants, hot afternoons, and rain on the way."}</p><blockquote>{notificationPreview}</blockquote><button type="button" className={notificationsEnabled?"is-enabled":""} onClick={toggleNotifications}>{notificationsEnabled?<><Check size={16}/> Notifications On</>:<><Bell size={16}/> Allow Notifications</>}</button>{notificationMessage&&<span role="status">{notificationMessage}</span>}<small>Always encouraging. Never noisy.</small></section>
    </div>
  </section>;
}
