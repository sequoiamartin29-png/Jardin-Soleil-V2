import React, { useEffect, useMemo, useState } from "react";
import { useGarden } from "../../context/GardenContext";
import { selectBuddyEstateUpdates } from "../../utils/buddyUpdates";
import "./BuddyCompanion.css";

const DEBUG_BUDDY = false;
export const buddyPathPoints = [
  { name:"Orchard Gate", x:48.0, y:45.0 },
  { name:"Upper-left Path", x:42.0, y:47.0 },
  { name:"Tea Garden Path", x:36.2, y:56.5 },
  { name:"Fountain-left", x:40.0, y:60.0 },
  { name:"Fountain-front", x:47.6, y:62.0 },
  { name:"Fountain-right", x:55.0, y:60.0 },
  { name:"Vegetable Garden Path", x:58.0, y:60.0 },
  { name:"Nursery Shed", x:55.4, y:64.7 },
  { name:"Lower-left Path", x:39.2, y:64.4 },
  { name:"Resting Tree", x:37.5, y:58.0 },
];

const localDateKey = (date = new Date()) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export default function BuddyCompanion({ onOpenJournal, weatherMode="clear", paused=false }) {
  const garden = useGarden();
  const [pointIndex, setPointIndex] = useState(0);
  const [bubble, setBubble] = useState("");
  const point = buddyPathPoints[pointIndex];
  const displayedPoint = bubble ? { x:43, y:48 } : point;
  const behavior = pointIndex === 9 ? "is-resting" : pointIndex === 2 ? "is-sniffing" : pointIndex === 5 ? "is-watching-water" : "is-walking";
  const estate = useMemo(() => selectBuddyEstateUpdates({ ...garden, plants:garden.activePlants }), [garden.activePlants, garden.journalEntries, garden.photos, garden.inventoryItems, garden.plantDiagnoses]);

  useEffect(() => {
    if (paused) return undefined;
    const patrol = window.setInterval(() => setPointIndex((index) => (index + 1) % buddyPathPoints.length), DEBUG_BUDDY ? 2500 : 22000);
    return () => window.clearInterval(patrol);
  }, [paused]);

  useEffect(() => {
    const today = localDateKey();
    const storageKey = "jardinSoleilBuddyGreetingDate";
    if (localStorage.getItem(storageKey) === today) return undefined;
    localStorage.setItem(storageKey, today);
    const greeting = window.setTimeout(() => setBubble("Welcome back, Sequoia. The garden has been waiting for you."), DEBUG_BUDDY ? 200 : 1200);
    const dismiss = window.setTimeout(() => setBubble(""), DEBUG_BUDDY ? 5000 : 9200);
    return () => { window.clearTimeout(greeting); window.clearTimeout(dismiss); };
  }, []);

  useEffect(() => {
    if (bubble || !estate.updates.length) return undefined;
    const lastUpdate = Number(localStorage.getItem("jardinSoleilBuddyLastUpdate") || 0);
    const cooldown = DEBUG_BUDDY ? 5000 : 10 * 60 * 1000;
    if (Date.now() - lastUpdate < cooldown) return undefined;
    const show = window.setTimeout(() => {
      setBubble(estate.updates[0].text);
      localStorage.setItem("jardinSoleilBuddyLastUpdate", String(Date.now()));
    }, DEBUG_BUDDY ? 1000 : 14000);
    const hide = window.setTimeout(() => setBubble(""), DEBUG_BUDDY ? 6500 : 23000);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  }, [bubble, estate.updates]);

  useEffect(() => {
    if (DEBUG_BUDDY) onOpenJournal?.();
  }, [onOpenJournal]);

  return (
    <div className={`js-buddy-layer weather-${weatherMode}${paused ? " is-paused" : ""}${DEBUG_BUDDY ? " is-debug" : ""}`} aria-hidden="false">
      <div className={`js-buddy-positioner ${behavior}`} style={{ "--buddy-x":`${displayedPoint.x}%`, "--buddy-y":`${displayedPoint.y}%` }}>
        <button className="js-buddy-button" type="button" aria-label="Open Buddy’s Garden Journal" onClick={onOpenJournal}>
          <BuddyIllustration />
        </button>
        {bubble && <div className="js-buddy-bubble" role="status"><span>{bubble}</span><button type="button" aria-label="Dismiss Buddy’s update" onClick={() => setBubble("")}>×</button></div>}
      </div>
      {DEBUG_BUDDY && <div className="js-buddy-debug" aria-hidden="true">{buddyPathPoints.map((pathPoint, index) => <i className={index === pointIndex ? "is-current" : ""} key={pathPoint.name} style={{ left:`${pathPoint.x}%`, top:`${pathPoint.y}%` }}>{pathPoint.name}</i>)}</div>}
    </div>
  );
}

function BuddyIllustration() {
  return <svg className="js-buddy-svg" viewBox="0 0 150 110" role="img" aria-label="Buddy, a white and tan Jack Russell Terrier wearing a green Jardin Soleil neckerchief">
    <defs><linearGradient id="buddy-white" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fffef8"/><stop offset="1" stopColor="#e6ddcf"/></linearGradient><linearGradient id="buddy-tan" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ca8b50"/><stop offset="1" stopColor="#98613b"/></linearGradient></defs>
    <g className="js-buddy-tail"><path d="M118 60c17-6 18-22 10-30" fill="none" stroke="#e9e1d5" strokeWidth="10" strokeLinecap="round"/><path d="M128 31c-4-7-7-9-10-10" fill="none" stroke="#a96c41" strokeWidth="7" strokeLinecap="round"/></g>
    <ellipse cx="82" cy="65" rx="43" ry="27" fill="url(#buddy-white)" stroke="#705d48" strokeWidth="2"/>
    <path d="M104 48c11 5 16 15 18 23-9-1-17-4-22-9z" fill="url(#buddy-tan)" opacity=".95"/>
    <path d="M54 78v23M75 82v20M102 79v22M117 75v25" stroke="#e9e1d5" strokeWidth="11" strokeLinecap="round"/><path d="M48 102h14M69 103h14M96 102h14M111 102h14" stroke="#665544" strokeWidth="3" strokeLinecap="round"/>
    <path d="M50 60c-18 3-32-7-32-25 0-19 14-30 31-29 20 1 30 14 28 31-1 13-11 21-27 23z" fill="url(#buddy-white)" stroke="#705d48" strokeWidth="2"/>
    <path d="M30 10C14 9 9 20 15 35c4 8 10 10 17 7z" fill="url(#buddy-tan)" stroke="#76503a" strokeWidth="2"/>
    <path d="M38 7c15-4 25 5 25 21-1 12-7 19-17 20-8-9-12-26-8-41z" fill="url(#buddy-tan)" opacity=".95"/>
    <ellipse cx="49" cy="28" rx="4" ry="5" fill="#292722"/><circle cx="50" cy="27" r="1" fill="#fff"/>
    <ellipse cx="21" cy="42" rx="6" ry="4" fill="#27251f"/><path d="M22 47c8 7 17 6 23 1" fill="none" stroke="#5d4638" strokeWidth="2" strokeLinecap="round"/>
    <path d="M36 51l30 1-8 24-15-8z" fill="#587248" stroke="#354b31" strokeWidth="2"/><circle cx="51" cy="61" r="7" fill="#c7a252" stroke="#7e5a25"/><text x="51" y="64" textAnchor="middle" fontFamily="Georgia,serif" fontSize="6" fontWeight="bold" fill="#fff9e8">JS</text>
  </svg>;
}
