import React from "react";

const stateLabels = {
  locked:"Locked",
  available:"Available",
  "in-progress":"In progress",
  completed:"Completed",
  mastered:"Mastered",
};

export default function GardenMatchJourney({ areas }) {
  return (
    <section className="garden-match-journey" aria-labelledby="garden-match-journey-title">
      <div className="garden-match-section-heading">
        <span>Your estate journey</span>
        <h2 id="garden-match-journey-title">Paths through Jardin Soleil</h2>
        <p>Complete collections to open new garden rooms and earn keepsake crests.</p>
      </div>
      <ol className="garden-match-journey__track">
        {areas.map((area, index) => (
          <li className={`garden-match-journey__area is-${area.state}`} key={area.id}>
            <div className="garden-match-journey__line" aria-hidden="true" />
            <span className="garden-match-journey__crest" aria-hidden="true">{area.icon}</span>
            <div>
              <small>Estate area {index + 1}</small>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
              <strong>{stateLabels[area.state]} · {area.completed}/{area.total} collections</strong>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
