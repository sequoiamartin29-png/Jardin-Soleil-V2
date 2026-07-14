import React from "react";
import BotanicalIcon from "./icons/BotanicalIcon";
import "./EstatePage.css";

export default function EstatePage({
  id,
  eyebrow = "Jardin Soleil · Estate Registry",
  title,
  description,
  icon = "generic-plant",
  actions,
  className = "",
  children,
}) {
  return (
    <section className={`js-estate-page ${className}`.trim()} aria-labelledby={id}>
      <header className="js-estate-page__hero">
        <span className="js-estate-page__botanical js-estate-page__botanical--left" aria-hidden="true" />
        <BotanicalIcon type={icon} size="xl" decorative />
        <div>
          <p>{eyebrow}</p>
          <h1 id={id}>{title}</h1>
          {description && <span>{description}</span>}
        </div>
        {actions && <div className="js-estate-page__actions">{actions}</div>}
        <span className="js-estate-page__botanical js-estate-page__botanical--right" aria-hidden="true" />
      </header>
      <div className="js-estate-page__rule" aria-hidden="true"><span>JS</span></div>
      {children}
    </section>
  );
}
