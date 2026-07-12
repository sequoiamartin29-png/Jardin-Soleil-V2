import React, { useId } from "react";
import { resolveBotanicalIconType } from "./botanicalIconRegistry";
import "./BotanicalIcon.css";

const palettes = {
  apple:["#b95f62","#7f9a59"], pear:["#c5b85e","#789456"], peach:["#df967b","#86985b"],
  plum:["#765979","#80935a"], cherry:["#b64f60","#7b9255"], fig:["#856078","#769052"],
  lemon:["#e2c54f","#789653"], mandarin:["#dc8c45","#779052"], orange:["#d9823f","#789052"],
  kumquat:["#e59a3b","#769353"], citrangequat:["#d89243","#738e51"], blueberry:["#61789e","#7c9258"],
  raspberry:["#bd5e72","#799255"], blackberry:["#594e69","#789151"], strawberry:["#c95763","#779452"],
  grape:["#78628c","#779055"], mint:["#78a27b","#547958"], tea:["#728f62","#4f704f"],
  herb:["#819f6b","#5d7d57"], tomato:["#c95850","#748f51"], pepper:["#c76a4d","#779253"],
  cucumber:["#6e9a69","#4f7651"], squash:["#d4a34f","#789052"], eggplant:["#69536f","#799153"],
  flower:["#c9859b","#789259"], rose:["#c86f80","#789157"], lavender:["#8673a2","#6f8d5a"],
  tree:["#688253","#456442"], shrub:["#78935d","#526f49"], vegetable:["#7f9d63","#55754e"],
  "container-plant":["#789467","#a67d4b"], "generic-fruit-tree":["#73905b","#b28a43"],
  "generic-plant":["#789667","#5b7955"]
};

const berryTypes = new Set(["blueberry","raspberry","blackberry"]);
const citrusTypes = new Set(["lemon","mandarin","orange","kumquat","citrangequat"]);

export default function BotanicalIcon({ type, plant, size="md", variant="watercolor", title, decorative=false, className="" }) {
  const resolved = resolveBotanicalIconType(type || plant);
  const [primary, leaf] = palettes[resolved] || palettes["generic-plant"];
  const uid = useId().replace(/:/g, "");
  const label = title || resolved.replace(/-/g, " ");
  const accessibility = decorative ? { "aria-hidden": true } : { role:"img", "aria-label":label };

  return (
    <span className={`botanical-icon botanical-icon--${size} botanical-icon--${variant} ${className}`.trim()} {...accessibility}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id={`${uid}-fruit`} cx="35%" cy="28%"><stop stopColor="#fff" stopOpacity=".48"/><stop offset=".28" stopColor={primary}/><stop offset="1" stopColor={primary} stopOpacity=".78"/></radialGradient>
          <linearGradient id={`${uid}-leaf`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={leaf} stopOpacity=".7"/><stop offset="1" stopColor={leaf}/></linearGradient>
          <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ddc58c"/><stop offset="1" stopColor="#a77e3e"/></linearGradient>
        </defs>
        <Artwork type={resolved} fruit={`url(#${uid}-fruit)`} leaf={`url(#${uid}-leaf)`} gold={`url(#${uid}-gold)`} primary={primary}/>
      </svg>
    </span>
  );
}

function Leaf({ x=50,y=30,rotate=0,fill }) { return <ellipse cx={x} cy={y} rx="12" ry="5.5" fill={fill} stroke="#4f6849" strokeWidth="1.4" transform={`rotate(${rotate} ${x} ${y})`}/>; }

function Artwork({ type, fruit, leaf, gold, primary }) {
  if (type === "pear") return <><path d="M50 17c1 8-2 11-4 15" fill="none" stroke="#745f3e" strokeWidth="4"/><Leaf x={59} y={22} rotate={-25} fill={leaf}/><path d="M50 29c-9 0-12 10-13 19-1 7-10 13-9 25 2 17 42 17 44 0 1-12-8-18-9-25-1-9-4-19-13-19z" fill={fruit} stroke="#6e7846" strokeWidth="2"/></>;
  if (type === "peach") return <><path d="M50 22c1 7-1 10-3 14" fill="none" stroke="#795d42" strokeWidth="4"/><Leaf x={61} y={27} rotate={-25} fill={leaf}/><path d="M49 35c-20-15-34 3-29 22 4 18 19 27 29 25 10 2 26-7 30-25 5-19-10-37-30-22z" fill={fruit} stroke="#a26758" strokeWidth="2"/><path d="M50 37c-5 17-4 31 0 43" fill="none" stroke="#bd745f" strokeWidth="1.7" opacity=".65"/></>;
  if (type === "cherry") return <><path d="M48 24c-2 18-9 21-16 34M49 24c1 16 10 20 17 31" fill="none" stroke="#5f7047" strokeWidth="2.5"/><Leaf x={57} y={28} rotate={-28} fill={leaf}/><circle cx="29" cy="66" r="15" fill={fruit} stroke="#854553" strokeWidth="2"/><circle cx="69" cy="63" r="15" fill={fruit} stroke="#854553" strokeWidth="2"/></>;
  if (type === "grape" || berryTypes.has(type)) {
    const points = type === "grape" ? [[38,38],[53,36],[68,40],[32,52],[47,51],[62,53],[76,53],[39,66],[55,67],[69,68],[49,80],[62,80]] : [[39,43],[53,40],[66,45],[34,56],[48,54],[62,57],[73,56],[40,69],[55,68],[68,70]];
    return <><path d="M52 31c-1-9 2-13 5-17" fill="none" stroke="#5e7049" strokeWidth="3"/><Leaf x={68} y={24} rotate={-24} fill={leaf}/>{points.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={type==="grape"?9:10} fill={fruit} stroke={primary} strokeWidth="1.2"/>)}</>;
  }
  if (type === "strawberry") return <><path d="M28 39c3 26 13 41 22 48 10-7 20-22 23-48-12-7-33-7-45 0z" fill={fruit} stroke="#9c4f58" strokeWidth="2"/><path d="M30 38c9-2 13-7 20-14 6 7 11 12 20 14-15 7-25 7-40 0z" fill={leaf} stroke="#4f714b" strokeWidth="2"/>{[[40,50],[56,48],[47,62],[61,64],[49,76]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="1.6" ry="2.4" fill="#f2d899"/>)}</>;
  if (["mint","tea","herb","lavender"].includes(type)) return <HerbArtwork type={type} leaf={leaf} primary={primary}/>;
  if (["flower","rose"].includes(type)) return <FlowerArtwork type={type} leaf={leaf} fruit={fruit}/>;
  if (["tomato","pepper","cucumber","squash","eggplant","vegetable"].includes(type)) return <VegetableArtwork type={type} fruit={fruit} leaf={leaf}/>;
  if (["tree","shrub","generic-fruit-tree","generic-plant","container-plant"].includes(type)) return <PlantArtwork type={type} leaf={leaf} gold={gold} fruit={fruit}/>;
  const shape = type === "lemon" ? <ellipse cx="50" cy="58" rx="25" ry="31"/> : type === "fig" ? <path d="M50 25c-4 13-23 22-23 42 0 25 46 25 46 0 0-20-19-29-23-42z"/> : <circle cx="50" cy="59" r={type==="kumquat"||type==="citrangequat"?23:27}/>;
  return <><path d="M49 29c0-8 3-12 6-16" fill="none" stroke="#755d3f" strokeWidth="4"/><Leaf x={63} y={26} rotate={-25} fill={leaf}/><g fill={fruit} stroke={citrusTypes.has(type)?"#a66f36":"#735243"} strokeWidth="2">{shape}</g>{citrusTypes.has(type)&&<path d="M33 58c10-6 23-8 34-2" fill="none" stroke="#f5d799" strokeOpacity=".45" strokeWidth="2"/>}</>;
}

function HerbArtwork({ type, leaf, primary }) { const lavender=type==="lavender"; return <><path d="M49 86c2-24 2-45 0-68M48 55L29 40M50 67l21-18M49 43l18-14" fill="none" stroke="#55714d" strokeWidth="3" strokeLinecap="round"/>{[[31,39,-28],[67,29,-24],[70,49,25],[38,59,-25],[59,70,25]].map(([x,y,r],i)=><Leaf key={i} x={x} y={y} rotate={r} fill={leaf}/>)}{lavender&&[22,32,42,52,62,72].map((y,i)=><ellipse key={i} cx={49+(i%2?4:-3)} cy={y} rx="5" ry="9" fill={primary} opacity={.78+i*.03}/>)}</>; }
function FlowerArtwork({ type, leaf, fruit }) { return <><path d="M50 84V58" stroke="#54734e" strokeWidth="3"/><Leaf x={37} y={70} rotate={-25} fill={leaf}/><Leaf x={63} y={64} rotate={25} fill={leaf}/>{[0,60,120,180,240,300].map((r)=><ellipse key={r} cx="50" cy="34" rx={type==="rose"?11:9} ry="21" fill={fruit} stroke="#a45f73" strokeWidth="1.3" transform={`rotate(${r} 50 45)`}/>)}<circle cx="50" cy="45" r="9" fill="#d7b25b"/></>; }
function VegetableArtwork({ type, fruit, leaf }) { if(type==="pepper") return <><path d="M40 31c-7 8-11 30-3 47 8 17 30 8 32-8 3-18-5-33-16-39z" fill={fruit} stroke="#8a5f43" strokeWidth="2"/><path d="M49 33c-2-9 2-13 7-17" stroke="#58764d" strokeWidth="4" fill="none"/><Leaf x={63} y={20} rotate={-24} fill={leaf}/></>; if(type==="cucumber") return <><path d="M24 64c0-24 43-47 54-29 11 20-31 48-48 42-4-2-6-7-6-13z" fill={fruit} stroke="#4f724c" strokeWidth="2"/>{[38,50,61].map((x,i)=><circle key={i} cx={x} cy={55-i*5} r="1.5" fill="#d9e5b3"/>)}</>; return <><circle cx="50" cy="58" r="26" fill={fruit} stroke="#745843" strokeWidth="2"/><path d="M28 39c10 2 15-4 22-14 8 10 14 16 23 14-9 8-16 10-23 7-7 3-14 1-22-7z" fill={leaf} stroke="#53734c" strokeWidth="2"/></>; }
function PlantArtwork({ type, leaf, gold, fruit }) { const pot=type==="container-plant"; return <>{pot&&<path d="M29 64h42l-6 25H35z" fill={gold} stroke="#765b38" strokeWidth="2"/>}<path d="M50 72V28M49 52L30 40M50 60l20-19" stroke="#506d49" strokeWidth="4" fill="none"/>{[[29,38,-28],[70,40,28],[49,27,-4],[37,59,-25],[62,58,26]].map(([x,y,r],i)=><Leaf key={i} x={x} y={y} rotate={r} fill={leaf}/>)}{type==="generic-fruit-tree"&&<circle cx="66" cy="32" r="6" fill={fruit}/>}</>; }
