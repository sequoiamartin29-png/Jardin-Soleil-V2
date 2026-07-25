import beeAsset from "../assets/wildlife/estate-bee.webp";
import butterflyAsset from "../assets/wildlife/estate-butterfly.webp";
import mothAsset from "../assets/wildlife/estate-moth.webp";
import swallowAsset from "../assets/wildlife/estate-swallow.webp";

export const WILDLIFE_ACTIVITY_LEVELS = ["Natural", "Minimal", "Off"];

export const wildlifePathPresets = {
  "bird-sky-arc": { id:"bird-sky-arc", depth:"background", direction:"forward" },
  "bird-hedge-swoop": { id:"bird-hedge-swoop", depth:"midground", direction:"forward" },
  "bird-high-glide": { id:"bird-high-glide", depth:"background", direction:"reverse" },
  "butterfly-rose-drift": { id:"butterfly-rose-drift", depth:"foreground", direction:"forward" },
  "butterfly-border-pause": { id:"butterfly-border-pause", depth:"midground", direction:"reverse" },
  "bee-flower-hop": { id:"bee-flower-hop", depth:"foreground", direction:"forward" },
  "bee-herb-hover": { id:"bee-herb-hover", depth:"midground", direction:"reverse" },
  "moth-lantern-orbit": { id:"moth-lantern-orbit", depth:"foreground", direction:"forward" },
  "moth-evening-drift": { id:"moth-evening-drift", depth:"midground", direction:"reverse" },
};

export const estateWildlife = [
  {
    id:"barn-swallow",
    species:"Barn swallow",
    type:"bird",
    asset:swallowAsset,
    activeSeasons:["spring", "summer", "autumn"],
    activeConditions:["clear", "partly_cloudy", "cloudy", "fog", "cold"],
    activeTimeOfDay:["dawn", "daytime", "golden-hour", "dusk"],
    minDuration:12,
    maxDuration:19,
    depthLayers:["background", "midground"],
    maxSimultaneous:1,
    pathIds:["bird-sky-arc", "bird-hedge-swoop", "bird-high-glide"],
    sizes:{ background:30, midground:46 },
    seasonalWeight:{ spring:1, summer:1, autumn:.72 },
  },
  {
    id:"painted-lady",
    species:"Painted lady butterfly",
    type:"butterfly",
    asset:butterflyAsset,
    activeSeasons:["spring", "summer", "autumn"],
    activeConditions:["clear", "partly_cloudy", "cloudy", "hot"],
    activeTimeOfDay:["daytime", "golden-hour"],
    minDuration:11,
    maxDuration:17,
    depthLayers:["midground", "foreground"],
    maxSimultaneous:1,
    pathIds:["butterfly-rose-drift", "butterfly-border-pause"],
    sizes:{ midground:22, foreground:30 },
    seasonalWeight:{ spring:.9, summer:1, autumn:.25 },
  },
  {
    id:"garden-bumblebee",
    species:"Garden bumblebee",
    type:"bee",
    asset:beeAsset,
    activeSeasons:["spring", "summer"],
    activeConditions:["clear", "partly_cloudy", "cloudy", "hot"],
    activeTimeOfDay:["daytime", "golden-hour"],
    minDuration:8,
    maxDuration:12,
    depthLayers:["midground", "foreground"],
    maxSimultaneous:1,
    pathIds:["bee-flower-hop", "bee-herb-hover"],
    sizes:{ midground:13, foreground:17 },
    seasonalWeight:{ spring:1, summer:1 },
  },
  {
    id:"hawk-moth",
    species:"Small hawk moth",
    type:"moth",
    asset:mothAsset,
    activeSeasons:["spring", "summer", "autumn"],
    activeConditions:["clear", "partly_cloudy", "cloudy"],
    activeTimeOfDay:["dusk", "night"],
    minDuration:12,
    maxDuration:18,
    depthLayers:["midground", "foreground"],
    maxSimultaneous:1,
    pathIds:["moth-lantern-orbit", "moth-evening-drift"],
    sizes:{ midground:20, foreground:27 },
    seasonalWeight:{ spring:.55, summer:1, autumn:.48 },
  },
];

export const normalizeWildlifeActivity = (value, legacyEnabled = true) => (
  WILDLIFE_ACTIVITY_LEVELS.includes(value)
    ? value
    : legacyEnabled === false
      ? "Off"
      : "Natural"
);

export const isWildlifeEligible = (wildlife, { condition, phase, season, windy }) => {
  if (!wildlife || windy) return false;
  return wildlife.activeConditions.includes(condition)
    && wildlife.activeTimeOfDay.includes(phase)
    && wildlife.activeSeasons.includes(season);
};
