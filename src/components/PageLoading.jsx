import React from "react";

export default function PageLoading({ label = "Opening Jardin Soleil" }) {
  return (
    <div className="js-page-loading" role="status" aria-live="polite">
      <span aria-hidden="true" />
      <strong>{label}…</strong>
    </div>
  );
}
