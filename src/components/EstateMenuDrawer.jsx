import React, { useEffect, useRef } from "react";
import BotanicalIcon from "./icons/BotanicalIcon";
import "./EstateMenuDrawer.css";

export const estateDrawerSections=[
  {title:"Estate",items:[
    {label:"Dashboard",page:"Dashboard",icon:"tree"},
    {label:"My Garden",page:"Garden",icon:"flower"},
    {label:"Orchard",page:"Orchard",icon:"generic-fruit-tree"},
    {label:"Plant Directory",page:"Plant Directory",icon:"generic-plant"},
    {label:"Plant Finder",page:"Plant Directory",icon:"herb"},
  ]},
  {title:"Journal & Planning",items:[
    {label:"Daily Logs",page:"Logbook",icon:"lavender"},
    {label:"New Journal Entry",page:"New Journal Entry",icon:"rose"},
    {label:"Journal Timeline",page:"Journal Timeline",icon:"herb"},
    {label:"Tasks",page:"Garden",icon:"vegetable"},
    {label:"Calendar",page:"Journal Timeline",icon:"flower"},
    {label:"Gallery",page:"Gallery",icon:"flower"},
    {label:"Photo Manager",page:"Photo Manager",icon:"shrub"},
  ]},
  {title:"Garden Tools",items:[
    {label:"Weather",page:"Weather",icon:"lavender"},
    {label:"Inventory",page:"Inventory",icon:"container-plant"},
    {label:"Add New Plant",page:"Add New Plant",icon:"generic-plant"},
    {label:"Archived Plants",page:"Archived Plants",icon:"tree"},
  ]},
  {title:"Learning & Apothecary",items:[
    {label:"Learning Center",page:"Learning",icon:"tree"},
    {label:"Tea Apothecary",page:"Tea Apothecary",icon:"tea"},
    {label:"Word Search",page:"Word Search",icon:"mint"},
    {label:"Garden Challenges",page:"Garden Challenges",icon:"apple"},
  ]},
  {title:"The Conservatory",items:[
    {label:"Open The Conservatory",page:"The Conservatory",icon:"shrub"},
    {label:"Buddy",page:"The Conservatory",companion:"buddy",icon:"tree"},
    {label:"Head Gardener",page:"The Conservatory",companion:"gardener",icon:"herb"},
    {label:"Herbalist",page:"The Conservatory",companion:"herbalist",icon:"tea"},
  ]},
  {title:"Settings",items:[
    {label:"Estate Environment",page:"Estate Environment",icon:"shrub"},
    {label:"Conservatory Settings",page:"The Conservatory",settings:true,icon:"tea"},
  ]},
];

export default function EstateMenuDrawer({open,onClose,onNavigate,onOpenConservatory,activePage,returnFocusRef}){
  const drawerRef=useRef(null);const closeRef=useRef(null);const wasOpen=useRef(false);
  useEffect(()=>{if(!open)return;wasOpen.current=true;const previous=document.body.style.overflow;document.body.style.overflow="hidden";requestAnimationFrame(()=>closeRef.current?.focus());const keydown=(event)=>{if(event.key==="Escape"){event.preventDefault();onClose();return;}if(event.key!=="Tab")return;const focusable=[...drawerRef.current.querySelectorAll('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')];if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}};document.addEventListener("keydown",keydown);return()=>{document.body.style.overflow=previous;document.removeEventListener("keydown",keydown);};},[open,onClose]);
  useEffect(()=>{if(open||!wasOpen.current)return;wasOpen.current=false;requestAnimationFrame(()=>returnFocusRef?.current?.focus());},[open,returnFocusRef]);
  if(!open)return null;
  const choose=(item)=>{onClose();if(item.companion||item.settings)onOpenConservatory(item.companion||null,item.settings);else onNavigate(item.page);};
  return <div className="js-estate-drawer-shell"><div className="js-estate-drawer-backdrop" aria-hidden="true" onMouseDown={onClose}/><aside id="estate-navigation-drawer" className="js-estate-drawer" ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="estate-drawer-title">
    <header><div className="js-estate-drawer__crest" aria-hidden="true">JS</div><div><p>Jardin Soleil</p><h2 id="estate-drawer-title">Estate Menu</h2></div><button ref={closeRef} type="button" aria-label="Close estate menu" onClick={onClose}>×</button></header>
    <nav aria-label="Jardin Soleil destinations">{estateDrawerSections.map((section)=><section key={section.title} aria-labelledby={`drawer-${section.title.replace(/[^a-z]+/gi,"-").toLocaleLowerCase()}`}><h3 id={`drawer-${section.title.replace(/[^a-z]+/gi,"-").toLocaleLowerCase()}`}>{section.title}</h3><div>{section.items.map((item)=>{const alias=["Plant Finder","Tasks","Calendar"].includes(item.label);const active=activePage===item.page&&!alias&&(!item.companion&&!item.settings);return <button type="button" key={item.label} className={active?"is-active":""} aria-current={active?"page":undefined} onClick={()=>choose(item)}><BotanicalIcon type={item.icon} size="sm" decorative/><span>{item.label}{active&&<small>Current page</small>}</span></button>;})}</div></section>)}</nav>
  </aside></div>;
}
