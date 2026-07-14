import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import { getGardenCalendarEvents } from "../utils/calendarEvents";
import EstatePage from "./EstatePage";
import "./Calendar.css";

const keyFor = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export default function Calendar({ onNavigate }) {
  const { tasks, journalEntries, teaWorkflows, activePlants } = useGarden();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const events = useMemo(() => getGardenCalendarEvents({ tasks, journalEntries, teaWorkflows, plants:activePlants }), [tasks, journalEntries, teaWorkflows, activePlants]);
  const monthPrefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const monthEvents = events.filter((event) => event.date.startsWith(monthPrefix));
  const firstDay = month.getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length:firstDay + days }, (_, index) => index < firstDay ? null : index - firstDay + 1);
  const move = (amount) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  return (
    <EstatePage id="calendar-title" title="Estate Calendar" description="A real calendar assembled from saved tasks, journal notes, plant care, harvest entries, and Garden-to-Cup milestones." icon="flower" actions={<button className="js-estate-button is-primary" type="button" onClick={() => onNavigate?.("Tasks")}>Open Tasks</button>}>
      <div className="js-calendar-toolbar"><button className="js-estate-button" type="button" onClick={() => move(-1)} aria-label="Previous month">←</button><h2>{month.toLocaleDateString([], { month:"long", year:"numeric" })}</h2><button className="js-estate-button" type="button" onClick={() => move(1)} aria-label="Next month">→</button></div>
      <div className="js-calendar" role="grid" aria-label={month.toLocaleDateString([], { month:"long", year:"numeric" })}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <strong className="js-calendar__weekday" role="columnheader" key={day}>{day}</strong>)}
        {cells.map((day, index) => day === null ? <span className="js-calendar__empty-cell" key={`empty-${index}`} /> : (() => { const date = keyFor(new Date(month.getFullYear(), month.getMonth(), day)); const dateEvents = monthEvents.filter((event) => event.date === date); return <article className="js-calendar__day" role="gridcell" aria-label={`${month.toLocaleDateString([], { month:"long" })} ${day}, ${month.getFullYear()}, ${dateEvents.length} events`} key={date}><time dateTime={date}>{day}</time>{dateEvents.slice(0, 3).map((event) => <span className={`is-${event.type.toLocaleLowerCase().replace(/\s+/g, "-")}`} key={event.id} title={`${event.title}${event.plantName ? ` · ${event.plantName}` : ""}`}>{event.title}</span>)}{dateEvents.length > 3 && <small>+{dateEvents.length - 3} more</small>}</article>; })())}
      </div>
      <section className="js-estate-panel js-calendar-agenda" aria-labelledby="calendar-agenda-title"><h2 id="calendar-agenda-title">This month’s estate ledger</h2>{monthEvents.length ? monthEvents.map((event) => <article key={event.id}><time dateTime={event.date}>{new Date(`${event.date}T12:00:00`).toLocaleDateString([], { month:"short", day:"numeric" })}</time><div><strong>{event.title}</strong><span>{event.type}{event.plantName ? ` · ${event.plantName}` : ""}</span></div></article>) : <p className="js-estate-empty">No saved tasks, journal events, care dates, harvests, or tea milestones fall in this month.</p>}</section>
    </EstatePage>
  );
}
