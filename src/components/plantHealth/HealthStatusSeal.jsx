import React from "react";

export default function HealthStatusSeal({ status = "Unconfirmed" }) {
  const className = status.toLocaleLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "");
  return <span className={`js-health-status js-health-status--${className}`}>{status}</span>;
}

