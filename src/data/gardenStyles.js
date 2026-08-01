import frenchChaletDesktop from "../assets/jardin-soleil-dashboard-crest-free.webp";
import frenchChaletMobile from "../assets/jardin-soleil-dashboard-french-chalet-mobile.webp";
import frenchChaletThumbnail from "../assets/jardin-soleil-dashboard-crest-free-thumbnail.webp";
import rainKissedDesktop from "../assets/jardin-soleil-dashboard-rain-kissed.webp";
import rainKissedMobile from "../assets/jardin-soleil-dashboard-rain-kissed-mobile.webp";
import rainKissedThumbnail from "../assets/jardin-soleil-dashboard-rain-kissed-thumbnail.webp";
import twilightWisteriaDesktop from "../assets/jardin-soleil-dashboard-twilight-wisteria.webp";
import twilightWisteriaMobile from "../assets/jardin-soleil-dashboard-twilight-wisteria-mobile.webp";
import twilightWisteriaThumbnail from "../assets/jardin-soleil-dashboard-twilight-wisteria-thumbnail.webp";
import woodlandDesktop from "../assets/garden-styles/woodland-estate-desktop.jpg";
import woodlandMobile from "../assets/garden-styles/woodland-estate-mobile.jpg";
import woodlandThumbnail from "../assets/garden-styles/woodland-estate-thumbnail.jpg";
import heritageDesktop from "../assets/garden-styles/heritage-farm-desktop.jpg";
import heritageMobile from "../assets/garden-styles/heritage-farm-mobile.jpg";
import heritageThumbnail from "../assets/garden-styles/heritage-farm-thumbnail.jpg";
import coastalDesktop from "../assets/garden-styles/coastal-cottage-desktop.jpg";
import coastalMobile from "../assets/garden-styles/coastal-cottage-mobile.jpg";
import coastalThumbnail from "../assets/garden-styles/coastal-cottage-thumbnail.jpg";

export const GARDEN_STYLE_STORAGE_KEY="jardinSoleilGardenStyle";
export const LEGACY_GARDEN_STYLE_STORAGE_KEYS=["jardinSoleilDashboardSkin"];
export const DEFAULT_GARDEN_STYLE_ID="french-chalet";
export const DEFAULT_GARDEN_HOTSPOT_MAP_ID="formal-estate-v2";

const styleDefaults={
  desktopImage:frenchChaletDesktop,
  mobileImage:frenchChaletMobile,
  thumbnail:frenchChaletThumbnail,
  overlayTone:"warm",
  textContrast:"dark",
  hotspotMapId:DEFAULT_GARDEN_HOTSPOT_MAP_ID,
  accent:"#9a7438",
  glow:"rgba(255, 247, 218, .82)",
  previewPosition:"center",
  mobilePosition:"center",
  sageGreeting:"The chalet garden is warm and ready for today’s gentle care.",
};

export const gardenStyles=[
  {
    ...styleDefaults,
    id:"french-chalet",
    name:"French Chalet",
    description:"Sunlit roses and the classic Jardin Soleil estate.",
  },
  {
    ...styleDefaults,
    id:"rain-kissed-chateau",
    name:"Rain-Kissed Château Garden",
    description:"Wet garden paths, roses, mist, and a stone manor.",
    desktopImage:rainKissedDesktop,
    mobileImage:rainKissedMobile,
    thumbnail:rainKissedThumbnail,
    overlayTone:"cool",
    accent:"#6f7d68",
    glow:"rgba(216, 232, 224, .86)",
    sageGreeting:"The rain-kissed paths have given the garden a welcome drink.",
  },
  {
    ...styleDefaults,
    id:"twilight-wisteria",
    name:"Twilight Wisteria Estate",
    description:"Lavender dusk, romantic blooms, and glowing lanterns.",
    desktopImage:twilightWisteriaDesktop,
    mobileImage:twilightWisteriaMobile,
    thumbnail:twilightWisteriaThumbnail,
    overlayTone:"twilight",
    textContrast:"light",
    accent:"#82668e",
    glow:"rgba(238, 218, 241, .86)",
    sageGreeting:"The wisteria garden is settling beautifully into the evening.",
  },
  {
    ...styleDefaults,
    id:"jardin-classique",
    name:"Jardin Classique",
    description:"A romantic French garden filled with flowers, elegant pathways, and château charm.",
    desktopImage:twilightWisteriaDesktop,
    mobileImage:twilightWisteriaMobile,
    thumbnail:twilightWisteriaThumbnail,
    overlayTone:"twilight",
    textContrast:"light",
    accent:"#82668e",
    glow:"rgba(238, 218, 241, .86)",
    sageGreeting:"Your estate garden is looking especially lovely today.",
  },
  {
    ...styleDefaults,
    id:"woodland-estate",
    name:"Woodland Estate",
    description:"A quiet woodland garden with practical beds, natural stone, cedar details, and deep forest textures.",
    desktopImage:woodlandDesktop,
    mobileImage:woodlandMobile,
    thumbnail:woodlandThumbnail,
    overlayTone:"woodland",
    textContrast:"light",
    accent:"#526151",
    glow:"rgba(190, 165, 119, .82)",
    sageGreeting:"The cedar beds feel settled and ready for a quiet soil check.",
  },
  {
    ...styleDefaults,
    id:"heritage-farm",
    name:"Heritage Farm",
    description:"A warm working homestead with orchard rows, cedar beds, weathered wood, and timeless farm character.",
    desktopImage:heritageDesktop,
    mobileImage:heritageMobile,
    thumbnail:heritageThumbnail,
    overlayTone:"heritage",
    textContrast:"dark",
    accent:"#916346",
    glow:"rgba(238, 202, 141, .86)",
    sageGreeting:"The orchard rows and working beds are ready for today’s care.",
  },
  {
    ...styleDefaults,
    id:"coastal-cottage",
    name:"Coastal Cottage",
    description:"A breezy coastal garden with hydrangeas, weathered cedar, soft grasses, and quiet seaside character.",
    desktopImage:coastalDesktop,
    mobileImage:coastalMobile,
    thumbnail:coastalThumbnail,
    overlayTone:"coastal",
    textContrast:"dark",
    accent:"#66798b",
    glow:"rgba(232, 224, 205, .86)",
    sageGreeting:"The coastal breeze is lovely today. Let’s see how quickly your garden is drying.",
  },
];

const normalizeStyle=(style)=>({
  ...styleDefaults,
  ...style,
  desktopImage:style?.desktopImage||styleDefaults.desktopImage,
  mobileImage:style?.mobileImage||style?.desktopImage||styleDefaults.mobileImage,
  thumbnail:style?.thumbnail||style?.desktopImage||styleDefaults.thumbnail,
});

export const findGardenStyle=(styleId)=>gardenStyles.find(({id})=>id===styleId);

export const getGardenStyle=(styleId)=>normalizeStyle(findGardenStyle(styleId)||gardenStyles[0]);

export const gardenHotspotMaps={
  [DEFAULT_GARDEN_HOTSPOT_MAP_ID]:[
    {id:"orchard",label:"Orchard",page:"Orchard",desktop:[12,30,25,18],mobile:[8,24,38,19]},
    {id:"flower-perennials",label:"Flower Garden",page:"Garden Collections",desktop:[63,30,26,18],mobile:[55,24,38,19]},
    {id:"tea-herb",label:"Tea & Herb Garden",page:"Garden Collections",desktop:[12,48,24,18],mobile:[7,43,38,18]},
    {id:"vegetable",label:"Vegetable Garden",page:"Garden Collections",desktop:[65,48,23,19],mobile:[57,43,37,18]},
    {id:"berry",label:"Berry Garden",page:"Garden Collections",desktop:[8,69,29,21],mobile:[7,64,39,20]},
    {id:"containers",label:"Container Garden",page:"Garden Collections",desktop:[66,69,28,21],mobile:[57,64,37,21]},
  ],
};

export const getGardenHotspots=(mapId)=>(gardenHotspotMaps[mapId]||gardenHotspotMaps[DEFAULT_GARDEN_HOTSPOT_MAP_ID]);

export const loadStoredGardenStyleId=()=>{
  try{
    const storage=globalThis.localStorage;
    for(const key of [GARDEN_STYLE_STORAGE_KEY,...LEGACY_GARDEN_STYLE_STORAGE_KEYS]){
      const storedId=storage?.getItem(key);
      if(findGardenStyle(storedId))return storedId;
    }
  }catch{/* Fall back without resetting either stored preference. */}
  return DEFAULT_GARDEN_STYLE_ID;
};
