import frenchChaletDesktop from "../assets/jardin-soleil-dashboard-crest-free.webp";
import frenchChaletMobile from "../assets/jardin-soleil-dashboard-french-chalet-mobile.webp";
import frenchChaletThumbnail from "../assets/jardin-soleil-dashboard-crest-free-thumbnail.webp";
import rainKissedDesktop from "../assets/jardin-soleil-dashboard-rain-kissed.webp";
import rainKissedMobile from "../assets/jardin-soleil-dashboard-rain-kissed-mobile.webp";
import rainKissedThumbnail from "../assets/jardin-soleil-dashboard-rain-kissed-thumbnail.webp";
import twilightWisteriaDesktop from "../assets/jardin-soleil-dashboard-twilight-wisteria.webp";
import twilightWisteriaMobile from "../assets/jardin-soleil-dashboard-twilight-wisteria-mobile.webp";
import twilightWisteriaThumbnail from "../assets/jardin-soleil-dashboard-twilight-wisteria-thumbnail.webp";

export const DASHBOARD_SKIN_STORAGE_KEY = "jardinSoleilDashboardSkin";
export const DEFAULT_DASHBOARD_SKIN_ID = "french-chalet";
export const DEFAULT_HOTSPOT_MAP_ID = "formal-estate-v2";

const skinDefaults = {
  desktopImage:frenchChaletDesktop,
  mobileImage:frenchChaletMobile,
  thumbnail:frenchChaletThumbnail,
  overlayTone:"warm",
  textContrast:"dark",
  hotspotMapId:DEFAULT_HOTSPOT_MAP_ID,
  accent:"#9a7438",
  glow:"rgba(255, 247, 218, .82)",
  previewPosition:"center",
};

export const dashboardSkins = [
  {
    ...skinDefaults,
    id:DEFAULT_DASHBOARD_SKIN_ID,
    name:"French Chalet",
    description:"Sunlit roses and the classic Jardin Soleil estate.",
  },
  {
    ...skinDefaults,
    id:"rain-kissed-chateau",
    name:"Rain-Kissed Château Garden",
    description:"Wet garden paths, roses, mist, and a stone manor.",
    desktopImage:rainKissedDesktop,
    mobileImage:rainKissedMobile,
    thumbnail:rainKissedThumbnail,
    overlayTone:"cool",
    accent:"#6f7d68",
    glow:"rgba(216, 232, 224, .86)",
  },
  {
    ...skinDefaults,
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
  },
];

const normalizeSkin = (skin) => ({
  ...skinDefaults,
  ...skin,
  desktopImage:skin?.desktopImage || skinDefaults.desktopImage,
  mobileImage:skin?.mobileImage || skin?.desktopImage || skinDefaults.mobileImage,
  thumbnail:skin?.thumbnail || skin?.desktopImage || skinDefaults.thumbnail,
});

export const getDashboardSkin = (skinId) => normalizeSkin(
  dashboardSkins.find(({ id }) => id === skinId) || dashboardSkins[0],
);

export const dashboardHotspotMaps = {
  [DEFAULT_HOTSPOT_MAP_ID]: [
    { id:"orchard", label:"Orchard", page:"Orchard", desktop:[12, 30, 25, 18], mobile:[8, 24, 38, 19] },
    { id:"flower-perennials", label:"Flower Garden", page:"Garden Collections", desktop:[63, 30, 26, 18], mobile:[55, 24, 38, 19] },
    { id:"tea-herb", label:"Tea & Herb Garden", page:"Garden Collections", desktop:[12, 48, 24, 18], mobile:[7, 43, 38, 18] },
    { id:"vegetable", label:"Vegetable Garden", page:"Garden Collections", desktop:[65, 48, 23, 19], mobile:[57, 43, 37, 18] },
    { id:"berry", label:"Berry Garden", page:"Garden Collections", desktop:[8, 69, 29, 21], mobile:[7, 64, 39, 20] },
    { id:"containers", label:"Container Garden", page:"Garden Collections", desktop:[66, 69, 28, 21], mobile:[57, 64, 37, 21] },
  ],
};

export const getDashboardHotspots = (mapId) => (
  dashboardHotspotMaps[mapId] || dashboardHotspotMaps[DEFAULT_HOTSPOT_MAP_ID]
);

export const loadStoredDashboardSkinId = () => {
  try {
    return getDashboardSkin(globalThis.localStorage?.getItem(DASHBOARD_SKIN_STORAGE_KEY)).id;
  } catch {
    return DEFAULT_DASHBOARD_SKIN_ID;
  }
};
