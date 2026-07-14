import React from "react";
import BotanicalIcon from "./icons/BotanicalIcon";
import "./EstatePageSystem.css";

export function EstatePageShell({
  id,
  eyebrow = "Jardin Soleil · Estate Registry",
  title,
  subtitle,
  icon = "generic-plant",
  actions,
  className = "",
  children,
}) {
  return (
    <section className={`js-estate-shell ${className}`.trim()} aria-labelledby={id}>
      <div className="js-estate-shell__canopy" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
      <div className="js-estate-shell__inner">
        <header className="js-estate-shell__hero">
          <div className="js-estate-shell__crest" aria-hidden="true">
            <BotanicalIcon type={icon} size="lg" decorative />
            <span>JS</span>
          </div>
          <EstateTitlePlaque id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} />
          {actions && <div className="js-estate-shell__actions">{actions}</div>}
        </header>
        <div className="js-estate-shell__divider" aria-hidden="true"><span>Jardin Soleil</span></div>
        <div className="js-estate-shell__content">{children}</div>
      </div>
    </section>
  );
}

export function EstateTitlePlaque({ id, eyebrow, title, subtitle }) {
  return (
    <div className="js-estate-title-plaque">
      <p>{eyebrow}</p>
      <h1 id={id}>{title}</h1>
      {subtitle && <span>{subtitle}</span>}
    </div>
  );
}

export function EstateSectionHeader({ id, eyebrow = "Estate Grove", title, count, icon = "tree", description }) {
  return (
    <header className="js-estate-section-header">
      <div className="js-estate-section-header__marker" aria-hidden="true">
        <BotanicalIcon type={icon} size="md" decorative />
      </div>
      <div>
        <p>{eyebrow}</p>
        <h2 id={id}>{title}</h2>
        {description && <span>{description}</span>}
      </div>
      <strong aria-label={`${count} ${count === 1 ? "plant" : "plants"}`}>{count}</strong>
    </header>
  );
}

export function EstateDataCard({ as: Component = "article", accent = "#8f7650", className = "", children, ...props }) {
  return (
    <Component
      className={`js-estate-data-card ${className}`.trim()}
      style={{ "--estate-card-accent": accent }}
      {...props}
    >
      <span className="js-estate-data-card__corner js-estate-data-card__corner--left" aria-hidden="true" />
      <span className="js-estate-data-card__corner js-estate-data-card__corner--right" aria-hidden="true" />
      {children}
    </Component>
  );
}

export function EstateActionButton({ variant = "default", className = "", type = "button", children, ...props }) {
  return (
    <button type={type} className={`js-estate-action js-estate-action--${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function BotanicalStatusSeal({ children, accent = "#6f8057" }) {
  return <span className="js-botanical-status-seal" style={{ "--estate-seal-accent": accent }}>{children || "Established"}</span>;
}

export function EstateFormSection({ legend, children, className = "" }) {
  return (
    <fieldset className={`js-estate-form-section ${className}`.trim()}>
      <legend><span aria-hidden="true">✦</span>{legend}<span aria-hidden="true">✦</span></legend>
      {children}
    </fieldset>
  );
}

