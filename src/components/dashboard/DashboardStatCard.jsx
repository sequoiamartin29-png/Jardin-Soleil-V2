import React from "react";
import BotanicalIcon from "../icons/BotanicalIcon";
import "./DashboardStatCard.css";

export default function DashboardStatCard({ icon, value, label, subtext="", accessibleName }) {
  return <article className="js-dashboard-stat-card" aria-label={accessibleName || `${value} ${label}`}>
    <span className="js-dashboard-stat-card__icon" aria-hidden="true"><StatIcon icon={icon}/></span>
    <strong>{value}</strong>
    <span className="js-dashboard-stat-card__label">{label}</span>
    {subtext&&<small>{subtext}</small>}
  </article>;
}

function StatIcon({icon}) {
  if(icon==="fruitTree")return <BotanicalIcon type="generic-fruit-tree" size="lg" decorative/>;
  if(icon==="mint")return <BotanicalIcon type="mint" size="lg" decorative/>;
  if(icon==="edibles")return <BotanicalIcon type="herb" size="lg" decorative/>;
  if(icon==="zones")return <svg viewBox="0 0 64 52"><path d="M9 22h46l-3 22H12z" fill="#8f6539" stroke="#5e482e" strokeWidth="2"/><path d="M13 22h38" stroke="#d1a650" strokeWidth="3"/><circle cx="19" cy="17" r="8" fill="#bd5865"/><circle cx="31" cy="13" r="9" fill="#d77f8d"/><circle cx="44" cy="17" r="8" fill="#b94f5f"/><path d="M19 26V16M31 25V12M44 26V16" stroke="#536e3f" strokeWidth="3"/></svg>;
  return <svg viewBox="0 0 64 52"><path d="M13 17h11l4-6h12l4 6h8a6 6 0 016 6v20H7V23a6 6 0 016-6z" fill="#62633f" stroke="#44462e" strokeWidth="2"/><circle cx="33" cy="31" r="11" fill="#eee6d2" stroke="#41442e" strokeWidth="3"/><circle cx="33" cy="31" r="6" fill="#8ca07b"/><path d="M48 13v8" stroke="#d1b26d" strokeWidth="3"/></svg>;
}
