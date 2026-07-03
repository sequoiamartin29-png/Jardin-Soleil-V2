import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Sprout, Trees, NotebookPen, Image, Package, GraduationCap, Puzzle, Home, Droplets, Bug, Scissors, Flower2} from 'lucide-react';
import './style.css';

const tabs = [
  ['dashboard','Dashboard',Home],['orchard','Orchard',Trees],['garden','Garden',Sprout],['log','Logbook',NotebookPen],['gallery','Gallery',Image],['inventory','Inventory',Package],['learn','Learn',GraduationCap],['game','Word Search',Puzzle]
];

const orchard = [
 ['Arkansas Black #1','Apple','Orchard Walkway right gate','Scale/woolly aphid scout'],['Arkansas Black #2','Apple','Orchard Walkway left gate','Monitor new growth'],['Honeycrisp','Apple','Right orchard line','Healthy showpiece'],['Fuji','Apple','Left orchard line','Pushing buds'],['Granny Smith','Apple','Left orchard line','Thin trunk; support'],['Dorsett Golden','Apple','Porch side','Moved from berry zone'],['Mr Pear','4-in-1 Pear','Right orchard','D’Anjou, Harrow Sweet, Bartlett; pears holding'],['4-in-1 Plum','Plum','Left orchard','New green growth'],['4-in-1 Cherry','Cherry','Right orchard','Track summer stress'],['FC1','Fruit Cocktail','Left orchard','Nectarine leafed; peach grafts weak'],['FC2','Fruit Cocktail','Left orchard','Nectarine + apricot grafts leafed'],['Beetlepeach','Bonfire Patio Peach','Driveway/front','Frost damage recovery'],["Mr Lemone'",'Meyer Lemon','Citrus/orchard','Lemonlets; wind protection'],['Ms Kishu','Kishu Mandarin','Citrus/orchard','Repot to 10 gal']
];

const garden = {
 'Vegetables':['Big Boy tomato','Early Girl tomato','Roma tomatoes','Little Napoli tomato','Husky Red Cherry tomato','Pineapple tomato','Japanese eggplant','Sweet jalapeño','Red bell pepper','Green bell pepper','Banana pepper','Cubanelle','Sugar Ann peas','Blue Lake bush bean','Corn','Zucchini','Long neck squash','Burpless cucumber','Yukon potatoes','Black Diamond watermelon','Crimson Sweet watermelon','Lettuce blend','Tender Sweet carrots','Rainbow carrots'],
 'Herbs & Tea':['Camellia sinensis / Ms Tea','Peppermint','Chocolate mint','Apple mint','Orange mint','Pineapple mint','Indian mint','Strawberry mint','Lemon balm','Stevia','Chamomile','Lemon verbena','Golden lemon thyme','Lemon thyme','Bee balm','Pineapple sage','Lemon basil','Lime basil','Cinnamon basil','Eucalyptus'],
 'Flowers & Ornamentals':['Julie Andrews rose / Ms Rose','Lavender','Elephant ear','Beetlepeach ornamental foliage']
};

const preloadedLogs = [
 ['March','Jardin Soleil begins shifting into the front-yard edible garden/orchard vision.'],
 ['May 11','Legacy blueberry added.'],['May 12','Dorsett Golden apple delivered.'],['May 26','Mr Pear 4-in-1 pear purchased and added to the orchard.'],['May 30',"Mr Lemone' Meyer lemon purchased with many lemonlets."],['June 1','Ms Kishu mandarin ordered; plum showing soft green growth.'],['June 8','Concord grape purchased; kiwi order canceled/refunded.'],['June 18','Wind knocked fruit cocktail trees and blackberry; Goji fed Garden-Tone.'],['June 20-22','Mint Brigade shipment arrived damaged/dead; refund issued.'],['June 24','Tea plant and Kishu delivered; square bed planted with corn, peas, bean, zucchini; Husky cherry and Pineapple tomato planted.'],['Late June','Kishu and lemon toppled in storm; repot plan to 10 gal.'],['July','Jardin Soleil V2 build starts with French chalet/pale pink/olive green theme.']
];

const supplies = ['Moisture-control soil','Kellogg organic soil','Topsoil + compost mix','Pine bark mulch','Garden-Tone','Fruit tree/citrus fertilizer','Root stimulator','Neem oil','10 gallon grow bags','Stakes','Pavers','Grow light'];
const vocab = ['caliper','deciduous','canopy','leader','scaffold','cambium','apical dominance','graft union','root flare','primocane','turgor','cucurbit','ecosystem','chlorosis','mycorrhizae','dormancy','hardening off','transpiration'];
const wordBank = ['ORCHARD','PEAR','APPLE','KISHU','LEMON','BASIL','MINT','CHAMOMILE','STEVIA','THYME','TOMATO','EGGPLANT','SQUASH','ZUCCHINI','POLLEN','PRUNING','MULCH','COMPOST','ROOTS','GRAFT','CANOPY','LEADER','BLOOM','HARVEST','WATER','FERTILIZE','NEEM','APHID','SCALE','CITRUS','BLUEBERRY','RASPBERRY','BLACKBERRY','GRAPE','PAVERS','GREENHOUSE','SEEDLING','CUCURBIT','CAMBIUM','CALIPER','TURGOR','DORMANCY','LAVENDER','ROSE','CORN','BEANS','PEAS','CARROT','LETTUCE'];

function pickWords(){
 const recent = JSON.parse(localStorage.getItem('recentWordSets')||'[]');
 let shuffled=[...wordBank].sort(()=>Math.random()-.5);
 let set=shuffled.slice(0,10);
 let guard=0;
 while(recent.some(r=>r.join(',')===set.join(',')) && guard++<20){ shuffled=[...wordBank].sort(()=>Math.random()-.5); set=shuffled.slice(0,10); }
 localStorage.setItem('recentWordSets', JSON.stringify([set,...recent].slice(0,8)));
 return set;
}
function makeGrid(words){
 const size=14; const grid=Array.from({length:size},()=>Array(size).fill(''));
 const dirs=[[1,0],[0,1],[1,1],[-1,1]];
 for(const word of words){
  let placed=false;
  for(let tries=0;tries<150&&!placed;tries++){
   const [dx,dy]=dirs[Math.floor(Math.random()*dirs.length)];
   const x=Math.floor(Math.random()*size), y=Math.floor(Math.random()*size);
   const endX=x+dx*(word.length-1), endY=y+dy*(word.length-1);
   if(endX<0||endX>=size||endY<0||endY>=size) continue;
   let ok=true; for(let i=0;i<word.length;i++){const c=grid[y+dy*i][x+dx*i]; if(c && c!==word[i]) ok=false;}
   if(!ok) continue;
   for(let i=0;i<word.length;i++) grid[y+dy*i][x+dx*i]=word[i]; placed=true;
  }
 }
 const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
 return grid.map(r=>r.map(c=>c||letters[Math.floor(Math.random()*letters.length)]));
}

function App(){
 const [tab,setTab]=useState('dashboard');
 const [logs,setLogs]=useState(()=>JSON.parse(localStorage.getItem('gardenLogs')||'[]'));
 const [entry,setEntry]=useState('');
 const [words,setWords]=useState(()=>pickWords());
 const grid=useMemo(()=>makeGrid(words),[words]);
 const addLog=()=>{ if(!entry.trim()) return; const next=[[new Date().toLocaleDateString(),entry],...logs]; setLogs(next); localStorage.setItem('gardenLogs',JSON.stringify(next)); setEntry(''); };
 return <div className="app"><aside><div className="brand"><Flower2/>Jardin Soleil</div>{tabs.map(([id,label,Icon])=><button key={id} onClick={()=>setTab(id)} className={tab===id?'active':''}><Icon size={18}/>{label}</button>)}</aside><main><Hero tab={tab}/>{tab==='dashboard'&&<Dashboard/>}{tab==='orchard'&&<Orchard/>}{tab==='garden'&&<Garden/>}{tab==='log'&&<Log logs={[...logs,...preloadedLogs]} entry={entry} setEntry={setEntry} addLog={addLog}/>} {tab==='gallery'&&<Gallery/>}{tab==='inventory'&&<Cards title="Garden Supplies" items={supplies}/>} {tab==='learn'&&<Cards title="Horticulture Vocabulary" items={vocab}/>} {tab==='game'&&<Game words={words} grid={grid} newGame={()=>setWords(pickWords())}/>}</main></div>
}
function Hero({tab}){const names={dashboard:'French Chalet Garden Dashboard',orchard:'The Orchard Walkway',garden:'Garden Beds & Tea Corridor',log:'Jardin Soleil Logbook',gallery:'Photo Timeline',inventory:'Supply Cabinet',learn:'Learning Nook',game:'Garden Word Search'}; return <section className={'hero '+tab}><h1>{names[tab]}</h1><p>Pale pinks, olive greens, soft cream cards, and a living record of Jardin Soleil.</p></section>}
function Dashboard(){return <div className="grid"><Card title="Today"><p>Check water first, then scout citrus, tomatoes, blueberries, and Mr Pear.</p></Card><Card title="Quick Tasks"><ul><li><Droplets/> Water cloth pots deeply in heat.</li><li><Bug/> Scout scale, aphids, and squash pests.</li><li><Scissors/> Remove dead or damaged leaves.</li></ul></Card><Card title="Garden Count"><p>Orchard trees, vegetables, herbs, tea plants, flowers, and active summer containers are preloaded.</p></Card></div>}
function Orchard(){return <div className="cards">{orchard.map(p=><Card key={p[0]} title={p[0]}><b>{p[1]}</b><p>{p[2]}</p><small>{p[3]}</small></Card>)}</div>}
function Garden(){return <>{Object.entries(garden).map(([cat,items])=><section key={cat}><h2>{cat}</h2><div className="chips">{items.map(i=><span key={i}>{i}</span>)}</div></section>)}</>}
function Log({logs,entry,setEntry,addLog}){return <><div className="logbox"><textarea value={entry} onChange={e=>setEntry(e.target.value)} placeholder="Log watering, repotting, pests, harvest, storm damage, or general notes..."></textarea><button onClick={addLog}>Save Log</button></div><div className="timeline">{logs.map((l,i)=><Card key={i} title={l[0]}><p>{l[1]}</p></Card>)}</div></>}
function Gallery(){return <div className="cards"><Card title="Photo homes ready"><p>Add folders later for Mr Pear, Beetlepeach, Ms Kishu, Mr Lemone', blueberries, tomatoes, tea corridor, and full garden progress.</p></Card><Card title="Design note"><p>Each section can get different French chalet artwork while staying pale pink, cream, and olive.</p></Card></div>}
function Cards({title,items}){return <section><h2>{title}</h2><div className="chips">{items.map(i=><span key={i}>{i}</span>)}</div></section>}
function Game({words,grid,newGame}){return <section><div className="gameTop"><h2>Word Search</h2><button onClick={newGame}>New Game</button></div><div className="wordgame"><div className="gridletters">{grid.flat().map((c,i)=><span key={i}>{c}</span>)}</div><div className="wordlist">{words.map(w=><b key={w}>{w}</b>)}</div></div></section>}
function Card({title,children}){return <article className="card"><h3>{title}</h3>{children}</article>}

createRoot(document.getElementById('root')).render(<App/>);
