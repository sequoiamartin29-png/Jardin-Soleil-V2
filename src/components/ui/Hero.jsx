import React from "react";

export default function Hero({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="hero">
      <h1>{title}</h1>

      {subtitle && <p>{subtitle}</p>}

      {children}
    </section>
  );
}
