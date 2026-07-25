import { normalizePlantText } from "./plantClassification.js";

export const plantCategories = ["Vegetables","Fruits","Fruit Trees","Herbs","Flowers","Shrubs","Vines","Houseplants","Trees","Other"];
export const plantGroups = ["Apples","Pears","Plums","Cherries","Citrus","Peach / Stone Fruit","Figs","Other Fruit Trees","Mints","Sage","Herbs","Tomatoes","Watermelons","Vegetables","Berries and Vines","Flowers and Perennials","Houseplants and Container Plants","Other / Uncategorized"];
export const plantCollections = ["Orchard","Citrus","Herbs","Mints","Tea Garden","Vegetable Garden","Flowers & Perennials","Berries & Vines","Container Plants","Nursery","Indoor Plants","Other / Uncategorized"];
export const gardenZoneOptions = ["Zone 1","Zone 2","Zone 3","Zone 4","Zone 5"];
export const plantStatuses = ["Active","Incoming","Dormant","Archived","Removed"];
const identity = (value) => normalizePlantText(value).replace(/[’']/g,"").replace(/[^a-z0-9]/g,"");
const exactTypeGroups = new Map([["apple","Apples"],["pear","Pears"],["plum","Plums"],["cherry","Cherries"],["peach","Peach / Stone Fruit"],["nectarine","Peach / Stone Fruit"],["apricot","Peach / Stone Fruit"],["fig","Figs"],["mint","Mints"],["sage","Sage"],["tomato","Tomatoes"],["watermelon","Watermelons"],["rose","Flowers and Perennials"]]);

export function suggestPlantGroup(input) {
  const type=normalizePlantText(input.type).replace(/[_-]+/g," ");
  if(exactTypeGroups.has(type))return exactTypeGroups.get(type);
  return {"Fruit Trees":"Other Fruit Trees",Herbs:"Herbs",Vegetables:"Vegetables",Fruits:"Berries and Vines",Flowers:"Flowers and Perennials",Vines:"Berries and Vines",Houseplants:"Houseplants and Container Plants",Shrubs:"Other / Uncategorized",Trees:"Other Fruit Trees",Other:"Other / Uncategorized"}[input.category]||"Other / Uncategorized";
}
const slug=(value)=>normalizePlantText(value).replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const validDate=(value)=>!value||!Number.isNaN(new Date(`${value}T12:00:00`).getTime());

export function validateAndNormalizePlant(input, existingPlants=[], editingId=null) {
  const errors={}; const name=String(input.name||"").trim(); const type=String(input.type||"").trim(); const category=String(input.category||"").trim();
  if(!name)errors.name="Display name is required."; if(!type)errors.type="Plant type is required."; if(!category)errors.category="Category is required.";
  if(input.health!==""&&input.health!==undefined){const health=Number(input.health);if(!Number.isFinite(health)||health<0||health>100)errors.health="Health must be between 0 and 100.";}
  const quantity=input.quantity===""||input.quantity===undefined?1:Number(input.quantity);if(!Number.isFinite(quantity)||quantity<1)errors.quantity="Quantity must be at least 1.";
  if(!validDate(input.plantingDate))errors.plantingDate="Enter a valid planting date."; if(!validDate(input.plantedDate))errors.plantedDate="Enter a valid planting date."; if(!validDate(input.expectedHarvest))errors.expectedHarvest="Enter a valid expected harvest date."; if(!validDate(input.acquisitionDate))errors.acquisitionDate="Enter a valid acquisition date.";
  const compare=[name,input.nickname,input.variety,input.botanicalName].map(identity).filter(Boolean);
  const duplicates=existingPlants.filter((plant)=>plant.id!==editingId&&[plant.name,plant.nickname,plant.variety,plant.botanicalName].map(identity).filter(Boolean).some((value)=>compare.includes(value)));
  const usedIds=new Set(existingPlants.filter((plant)=>plant.id!==editingId).map((plant)=>plant.id)); let id=editingId||`plant-${slug(name)}`; let suffix=2; while(usedIds.has(id))id=`plant-${slug(name)}-${suffix++}`;
  const record={id,name,commonName:String(input.commonName||name).trim(),type,category,group:String(input.group||suggestPlantGroup({type,category})).trim(),quantity,createdAt:input.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
  ["nickname","variety","botanicalName","collection","zoneId","gardenZone","location","status","healthStatus","sun","sunlight","water","watering","soil","plantingMethod","plantedDate","plantingDate","expectedHarvest","acquisitionDate","source","notes","iconType"].forEach((field)=>{const value=String(input[field]||"").trim();if(value)record[field]=value;});
  ["identifiedAt","identificationConfidence","plantFinderIdentificationId"].forEach((field)=>{const value=String(input[field]||"").trim();if(value)record[field]=value;});
  if(input.health!==""&&input.health!==undefined)record.health=Number(input.health);
  const tags=Array.isArray(input.tags)?input.tags:String(input.tags||"").split(","); record.tags=[...new Set(tags.map((tag)=>tag.trim()).filter(Boolean))];
  return {valid:Object.keys(errors).length===0,errors,duplicates,record};
}

export function validatePlantMove(input, plant, existingPlants=[]) {
  const errors={};
  const collection=String(input.collection||"Other / Uncategorized").trim();
  const category=String(input.category||"Other / Uncategorized").trim();
  const type=String(input.type||"").trim();
  const group=String(input.group||suggestPlantGroup({type,category})).trim()||"Other / Uncategorized";
  if(!type)errors.type="Plant type is required.";
  if(!category)errors.category="Category is required.";
  const currentIdentity=[plant.name,plant.nickname,input.variety,plant.botanicalName].map(identity).filter(Boolean);
  const duplicates=existingPlants.filter((candidate)=>candidate.id!==plant.id&&[candidate.name,candidate.nickname,candidate.variety,candidate.botanicalName].map(identity).filter(Boolean).some((value)=>currentIdentity.includes(value)));
  return {
    valid:Object.keys(errors).length===0,
    errors,
    duplicates,
    updates:{
      collection,
      category,
      group,
      type,
      variety:String(input.variety||"").trim(),
      botanicalFamily:String(input.botanicalFamily||"").trim(),
      gardenZone:String(input.gardenZone||"").trim(),
      location:String(input.location||"").trim(),
      status:String(input.status||"Active").trim(),
    },
  };
}

export function preserveDeletedPlantReference(record, plant) {
  return record.plantId===plant.id?{...record,plantId:null,deletedPlantId:plant.id,deletedPlantName:plant.name,plantDeleted:true}:record;
}
