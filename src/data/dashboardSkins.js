import frenchChaletArtwork from "../assets/jardin-soleil-dashboard-crest-free.png";
import rainKissedArtwork from "../assets/jardin-soleil-dashboard-rain-kissed.png";
import twilightWisteriaArtwork from "../assets/jardin-soleil-dashboard-twilight-wisteria.png";

export const DASHBOARD_SKIN_STORAGE_KEY = "jardinSoleilDashboardSkin";
export const DEFAULT_DASHBOARD_SKIN_ID = "french-chalet";

export const dashboardSkins = [
  {
    id: DEFAULT_DASHBOARD_SKIN_ID,
    name: "French Chalet",
    description: "Sunlit roses and the classic Jardin Soleil estate.",
    backgroundImage: frenchChaletArtwork,
    accent: "#9a7438",
    glow: "rgba(255, 247, 218, .82)",
    previewPosition: "center 24%",
  },
  {
    id: "rain-kissed-chateau",
    name: "Rain-Kissed Château Garden",
    description: "Wet garden paths, roses, mist, and a stone manor.",
    backgroundImage: rainKissedArtwork,
    accent: "#6f7d68",
    glow: "rgba(216, 232, 224, .86)",
    previewPosition: "center 35%",
  },
  {
    id: "twilight-wisteria",
    name: "Twilight Wisteria Estate",
    description: "Lavender dusk, romantic blooms, and glowing lanterns.",
    backgroundImage: twilightWisteriaArtwork,
    accent: "#82668e",
    glow: "rgba(238, 218, 241, .86)",
    previewPosition: "center 25%",
  },
];

export const getDashboardSkin = (skinId) => (
  dashboardSkins.find(({ id }) => id === skinId) || dashboardSkins[0]
);
