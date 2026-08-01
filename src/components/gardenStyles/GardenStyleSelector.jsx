import React, { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { useEstateEnvironment } from "../../context/EstateEnvironmentContext";
import { gardenStyles, getGardenStyle } from "../../data/gardenStyles";
import { WILDLIFE_ACTIVITY_LEVELS } from "../../data/estateWildlife";
import GardenStyleCard from "./GardenStyleCard";
import "../DashboardSkinDialog.css";

export default function GardenStyleSelector({open,activeStyleId,previewStyleId,onPreview,onApply,onClose}){
  const {settings,updateSetting}=useEstateEnvironment();
  const dialogRef=useRef(null);
  const closeRef=useRef(null);
  const previousFocusRef=useRef(null);

  useEffect(()=>{
    if(!open)return undefined;
    previousFocusRef.current=document.activeElement;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    requestAnimationFrame(()=>closeRef.current?.focus());
    const handleKeyDown=(event)=>{
      if(event.key==="Escape"){event.preventDefault();onClose();return;}
      if(event.key!=="Tab")return;
      const focusable=[...dialogRef.current.querySelectorAll('button:not([disabled]),[href],select,[tabindex]:not([tabindex="-1"])')];
      if(!focusable.length)return;
      const first=focusable[0],last=focusable.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    document.addEventListener("keydown",handleKeyDown);
    return()=>{
      document.body.style.overflow=previousOverflow;
      document.removeEventListener("keydown",handleKeyDown);
      requestAnimationFrame(()=>previousFocusRef.current?.focus?.());
    };
  },[open,onClose]);

  if(!open)return null;
  const previewStyle=getGardenStyle(previewStyleId);

  return <div className="js-skin-dialog__backdrop" onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose();}}>
    <section className="js-skin-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="garden-styles-title" aria-describedby="garden-styles-description">
      <header>
        <div><p>Appearance · Your estate</p><h2 id="garden-styles-title">Garden Styles</h2><span id="garden-styles-description">Choose the atmosphere that feels most at home in your garden.</span></div>
        <button ref={closeRef} type="button" aria-label="Close Garden Styles" onClick={onClose}>×</button>
      </header>

      <div className="js-skin-dialog__active-preview" data-tone={previewStyle.overlayTone} style={{"--style-preview-position":previewStyle.previewPosition,"--style-mobile-position":previewStyle.mobilePosition}}>
        <picture><source media="(max-width: 620px)" srcSet={previewStyle.mobileImage}/><img src={previewStyle.desktopImage} alt={`${previewStyle.name} full garden style preview`}/></picture>
        <div><span><Sparkles size={12}/> Previewing</span><strong>{previewStyle.name}</strong></div>
      </div>

      <div className="js-skin-dialog__options" role="list" aria-label="Available garden styles">
        {gardenStyles.map((style)=><GardenStyleCard key={style.id} style={style} isActive={style.id===activeStyleId} isPreviewing={style.id===previewStyleId} onPreview={onPreview} onApply={onApply}/>)}
      </div>

      <section className="js-skin-dialog__wildlife" aria-labelledby="wildlife-activity-title">
        <div><p>Related atmosphere</p><h3 id="wildlife-activity-title">Wildlife Activity</h3><span>Choose how often weather-appropriate birds and insects visit every Garden Style.</span></div>
        <label><span className="js-visually-hidden">Wildlife Activity</span><select aria-label="Wildlife Activity" value={settings.wildlifeActivity} onChange={(event)=>updateSetting("wildlifeActivity",event.target.value)}>{WILDLIFE_ACTIVITY_LEVELS.map((level)=><option key={level}>{level}</option>)}</select></label>
      </section>

      <footer><span>Your style changes artwork only. Garden records and recommendations stay exactly as they are.</span><div><button type="button" onClick={onClose}>Cancel</button><button className="is-primary" type="button" aria-label={`Apply ${previewStyle.name} garden style`} onClick={()=>onApply(previewStyle.id)}>Apply Style: {previewStyle.name}</button></div></footer>
    </section>
  </div>;
}
