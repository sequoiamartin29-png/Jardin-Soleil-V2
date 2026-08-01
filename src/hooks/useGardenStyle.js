import { useCallback, useEffect, useState } from "react";
import {
  GARDEN_STYLE_STORAGE_KEY,
  getGardenStyle,
  loadStoredGardenStyleId,
} from "../data/gardenStyles";

export default function useGardenStyle(){
  const [styleId,setStyleId]=useState(loadStoredGardenStyleId);
  const [previewStyleId,setPreviewStyleId]=useState(loadStoredGardenStyleId);
  const [selectorOpen,setSelectorOpen]=useState(false);

  useEffect(()=>{
    try{localStorage.setItem(GARDEN_STYLE_STORAGE_KEY,styleId);}
    catch{/* The selected style remains active for this session. */}
  },[styleId]);

  const openSelector=useCallback(()=>{
    setPreviewStyleId(styleId);
    setSelectorOpen(true);
  },[styleId]);

  const closeSelector=useCallback(()=>{
    setPreviewStyleId(styleId);
    setSelectorOpen(false);
  },[styleId]);

  const applyStyle=useCallback((nextId)=>{
    const resolved=getGardenStyle(nextId).id;
    setStyleId(resolved);
    setPreviewStyleId(resolved);
    setSelectorOpen(false);
  },[]);

  return{
    styleId,
    previewStyleId,
    selectorOpen,
    displayedStyleId:selectorOpen?previewStyleId:styleId,
    openSelector,
    closeSelector,
    previewStyle:setPreviewStyleId,
    applyStyle,
  };
}
