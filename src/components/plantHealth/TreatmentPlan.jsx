import React from "react";

export default function TreatmentPlan({ plan = [] }) {
  return (
    <section className="js-health-treatment" aria-labelledby="treatment-plan-title">
      <header><p>Tiered response</p><h2 id="treatment-plan-title">Treatment plan</h2></header>
      <ol>
        {plan.map((item) => <li key={item.tier}>
          <strong>{item.tier}</strong>
          {item.target && <p><b>Targets:</b> {item.target}</p>}
          <p>{item.text}</p>
          {item.safety && <p><b>Safety:</b> {item.safety}</p>}
          {item.pollinators && <p><b>Pollinators:</b> {item.pollinators}</p>}
        </li>)}
      </ol>
      <aside>
        <strong>Pollinator and edible-garden safety</strong>
        <p>Avoid spraying open blooms or during active pollinator periods. Follow local law and the complete product label. For edible plants, use only the label’s harvest and pre-harvest intervals.</p>
      </aside>
    </section>
  );
}
