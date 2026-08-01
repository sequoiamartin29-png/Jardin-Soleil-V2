export {
  LEGACY_GARDEN_STYLE_STORAGE_KEYS,
  DEFAULT_GARDEN_STYLE_ID as DEFAULT_DASHBOARD_SKIN_ID,
  DEFAULT_GARDEN_HOTSPOT_MAP_ID as DEFAULT_HOTSPOT_MAP_ID,
  gardenStyles as dashboardSkins,
  getGardenStyle as getDashboardSkin,
  gardenHotspotMaps as dashboardHotspotMaps,
  getGardenHotspots as getDashboardHotspots,
  loadStoredGardenStyleId as loadStoredDashboardSkinId,
} from "./gardenStyles";

export const DASHBOARD_SKIN_STORAGE_KEY="jardinSoleilDashboardSkin";
