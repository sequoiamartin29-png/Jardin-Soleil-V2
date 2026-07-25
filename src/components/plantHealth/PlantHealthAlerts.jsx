import React from "react";
import BotanicalIcon from "../icons/BotanicalIcon";

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString();
};

export default function PlantHealthAlerts({
  alerts,
  compact = false,
  onOpenCase,
  onOpenPlant,
  onReview,
  onViewAll,
}) {
  const visibleAlerts = compact ? alerts.slice(0, 3) : alerts;

  return (
    <section className={`js-health-attention${compact ? " is-compact" : ""}`} aria-labelledby={compact ? "health-attention-summary-title" : "health-attention-title"}>
      <header>
        <div>
          <p>Actionable plant-health alerts</p>
          <h2 id={compact ? "health-attention-summary-title" : "health-attention-title"}>Needs Attention</h2>
          <span>Reviewed alerts remain active until their case is resolved or the plant’s health improves.</span>
        </div>
        <strong>{alerts.filter((alert) => alert.unread).length} unread</strong>
      </header>

      {visibleAlerts.length ? (
        <div className="js-health-attention__list">
          {visibleAlerts.map((alert) => (
            <article className={`js-health-alert-card is-${alert.severity.toLocaleLowerCase()}${alert.unread ? " is-unread" : " is-reviewed"}`} key={alert.id}>
              <div className="js-health-alert-card__image">
                {alert.thumbnail
                  ? <img src={alert.thumbnail} alt="" />
                  : <BotanicalIcon type="generic-plant" size="lg" decorative />}
              </div>
              <div className="js-health-alert-card__body">
                <div className="js-health-alert-card__meta">
                  <span>{alert.severity}</span>
                  <span>{alert.status}</span>
                  <time dateTime={alert.createdAt}>{formatDate(alert.createdAt)}</time>
                </div>
                <h3>{alert.plantName}</h3>
                <strong>{alert.title}</strong>
                <p>{alert.plantMissing ? "This plant record is no longer available." : alert.message}</p>
                {alert.overdue && <small>Follow-up due or overdue</small>}
              </div>
              <div className="js-health-alert-card__actions">
                {!alert.plantMissing && <button type="button" onClick={() => onOpenPlant(alert)}>Open Plant</button>}
                {alert.healthCaseId && <button type="button" onClick={() => onOpenCase(alert)}>Open Health Case</button>}
                {alert.unread
                  ? <button className="is-review" type="button" onClick={() => onReview(alert)}>Mark Reviewed</button>
                  : <span aria-label="Alert reviewed">Reviewed</span>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="js-health-attention__empty">
          <strong>No plants currently need attention.</strong>
          <p>New unresolved cases, overdue follow-ups, and Critical or Poor plant records will appear here.</p>
        </div>
      )}

      {compact && alerts.length > visibleAlerts.length && (
        <button className="js-health-attention__all" type="button" onClick={onViewAll}>
          View all {alerts.length} alerts
        </button>
      )}
    </section>
  );
}
