import React from "react";

const rows = [
  ["Leaf", (plant) => `${plant.leafArrangement?.join(", ") || "Unknown"}; ${plant.leafTraits?.join(", ") || "unknown"}`],
  ["Flower", (plant) => `${plant.flowerColors?.join(", ") || "Unknown"}; ${plant.flowerShapes?.join(", ") || "unknown"}`],
  ["Fruit", (plant) => plant.fruit?.join(", ") || "Unknown"],
  ["Bark & habit", (plant) => plant.stem?.join(", ") || plant.habit || "Unknown"],
  ["Habitat", (plant) => plant.habitat?.join(", ") || "Unknown"],
  ["Region", (plant) => plant.regions?.join(", ") || "Unknown"],
  ["Toxicity", (plant) => plant.toxicity || "Unknown"],
  ["Edibility", (plant) => plant.edibility || "Unknown"],
  ["Invasive status", (plant) => plant.invasiveStatus || "Unknown"],
];

export default function CandidateComparison({ candidates, onClose }) {
  return (
    <section className="js-finder-comparison" aria-labelledby="candidate-comparison-title">
      <header><div><p>Side-by-side specimen key</p><h2 id="candidate-comparison-title">Compare Candidates</h2></div><button type="button" onClick={onClose}>Close comparison</button></header>
      <div className="js-finder-comparison__scroll" tabIndex="0" aria-label="Scrollable plant comparison">
        <table>
          <thead><tr><th scope="col">Characteristic</th>{candidates.map((candidate) => <th scope="col" key={candidate.id}><strong>{candidate.commonName}</strong><em>{candidate.botanicalName}</em></th>)}</tr></thead>
          <tbody>{rows.map(([label, read]) => <tr key={label}><th scope="row">{label}</th>{candidates.map((candidate) => <td key={candidate.id}>{read(candidate)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

