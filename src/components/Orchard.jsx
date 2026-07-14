import React, { useMemo } from "react";
import { useGarden } from "../context/GardenContext";
import BotanicalIcon from "./icons/BotanicalIcon";
import {
  BotanicalStatusSeal,
  EstateActionButton,
  EstateDataCard,
  EstatePageShell,
  EstateSectionHeader,
} from "./EstatePageSystem";
import { getPlantDirectoryGroup, isOrchardFruitTree, orchardDirectoryGroups } from "../utils/plantClassification";
import "./Orchard.css";

const badgeColors = {
  Healthy: "#6b845b",
  Growing: "#78905d",
  Producing: "#b4863d",
  Fruiting: "#a96e43",
  Monitoring: "#a76e44",
  Recovering: "#9a5b5e",
  "New Arrival": "#66869d",
};

const groveDetails = {
  Apples: { icon: "apple", accent: "#a85b5e", description: "Heritage apples and espaliered estate favorites." },
  Pears: { icon: "pear", accent: "#9a9149", description: "Elegant pear trees trained for blossom and harvest." },
  Plums: { icon: "plum", accent: "#715673", description: "Plum-rich branches gathered in the purple-fruit grove." },
  Cherries: { icon: "cherry", accent: "#a94e5e", description: "Spring blossom and jewel-toned cherry harvests." },
  "Citrus Trees": { icon: "orange", accent: "#c17a36", display: "Citrus", description: "The warm citrus court of lemons, mandarins, and rare fruits." },
  Figs: { icon: "fig", accent: "#765870", description: "Sun-warmed figs held in a sheltered estate corner." },
  "Peach / Stone Fruit": { icon: "peach", accent: "#c98069", description: "Peaches and stone fruits in the golden orchard walk." },
  "Other Fruit Trees": { icon: "generic-fruit-tree", accent: "#6c7c55", description: "Distinctive fruiting trees with their own estate character." },
};

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const recordedValue = (value, fallback = "Not recorded") => value || fallback;

export default function Orchard({ onSelectPlant, onEditPlant, onAddPlant }) {
  const { activePlants } = useGarden();
  const orchardPlants = activePlants.filter(isOrchardFruitTree);
  const groupedPlants = useMemo(() => {
    const groups = Object.fromEntries(orchardDirectoryGroups.map((group) => [group, []]));

    orchardPlants.forEach((plant) => groups[getPlantDirectoryGroup(plant)].push(plant));

    return orchardDirectoryGroups
      .map((group) => ({
        group,
        plants: groups[group].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
        ),
      }))
      .filter(({ plants: grouped }) => grouped.length > 0);
  }, [orchardPlants]);

  return (
    <EstatePageShell
      id="orchard-title"
      eyebrow="Jardin Soleil · Fruiting Estate"
      title="Jardin Soleil Orchard"
      subtitle="The fruiting groves of the estate"
      icon="generic-fruit-tree"
      className="js-orchard-estate"
      actions={<EstateActionButton variant="gate" onClick={onAddPlant}>Add New Plant</EstateActionButton>}
    >
      <div className="js-orchard-estate__welcome">
        <p>Orchard Ledger</p>
        <strong>{orchardPlants.length}</strong>
        <span>{orchardPlants.length === 1 ? "fruit tree" : "fruit trees"} growing across {groupedPlants.length} {groupedPlants.length === 1 ? "grove" : "groves"}</span>
      </div>

      {groupedPlants.length === 0 && (
        <EstateDataCard className="js-orchard-estate__empty">
          <BotanicalIcon type="generic-fruit-tree" size="lg" decorative />
          <h2>The orchard ledger is ready</h2>
          <p>Add the estate’s first fruit tree to begin a new grove.</p>
          <EstateActionButton variant="gate" onClick={onAddPlant}>Add New Plant</EstateActionButton>
        </EstateDataCard>
      )}

      {groupedPlants.map(({ group, plants: grouped }) => {
        const details = groveDetails[group] || groveDetails["Other Fruit Trees"];
        const headingId = `orchard-group-${slugify(group)}`;

        return (
          <section
            className="js-orchard-grove"
            key={group}
            aria-labelledby={headingId}
            style={{ "--grove-accent": details.accent }}
          >
            <EstateSectionHeader
              id={headingId}
              title={details.display || group}
              icon={details.icon}
              count={grouped.length}
              description={details.description}
            />

            <div className="js-orchard-grove__grid">
              {grouped.map((plant) => {
                const location = plant.gardenZone || plant.location;
                const health = plant.health === 0 || plant.health ? `${plant.health}%` : "Not recorded";
                const variety = plant.variety || plant.botanicalName || plant.type;

                return (
                  <EstateDataCard className="js-orchard-card" key={plant.id} accent={details.accent}>
                    <div className="js-orchard-card__illustration" aria-hidden="true">
                      <span className="js-orchard-card__branch" />
                      <BotanicalIcon plant={plant} size="xl" decorative />
                    </div>

                    <div className="js-orchard-card__body">
                      <div className="js-orchard-card__heading">
                        <div>
                          <p>{plant.nickname || "Estate Plant Dossier"}</p>
                          <h3>{plant.name}</h3>
                          <span>{recordedValue(variety)}</span>
                        </div>
                        <BotanicalStatusSeal accent={badgeColors[plant.status] || badgeColors.Growing}>
                          {plant.status || "Established"}
                        </BotanicalStatusSeal>
                      </div>

                      <dl className="js-orchard-card__facts">
                        <div><dt>Health</dt><dd>{health}</dd></div>
                        <div><dt>Estate location</dt><dd>{recordedValue(location, "Unassigned")}</dd></div>
                        <div><dt>Sunlight</dt><dd>{recordedValue(plant.sun)}</dd></div>
                        <div><dt>Watering</dt><dd>{recordedValue(plant.water)}</dd></div>
                      </dl>

                      <div className="js-orchard-card__actions">
                        <EstateActionButton variant="primary" onClick={() => onSelectPlant(plant)}>Open Plant Profile</EstateActionButton>
                        {onEditPlant && <EstateActionButton variant="ledger" onClick={() => onEditPlant(plant)}>Edit Plant</EstateActionButton>}
                        {onEditPlant && <EstateActionButton variant="quiet" onClick={() => onEditPlant(plant)}>Move / Reclassify</EstateActionButton>}
                      </div>
                    </div>
                  </EstateDataCard>
                );
              })}
            </div>
          </section>
        );
      })}
    </EstatePageShell>
  );
}
