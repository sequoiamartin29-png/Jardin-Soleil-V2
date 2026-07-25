import React, { useEffect, useMemo, useRef, useState } from "react";
import { useEstateEnvironment } from "../../context/EstateEnvironmentContext";
import {
  estateWildlife,
  isWildlifeEligible,
  normalizeWildlifeActivity,
  wildlifePathPresets,
} from "../../data/estateWildlife";
import "./EstateWildlife.css";

const hashText = (value) => {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededUnit = (seed, sequence, salt = 0) => {
  let value = (seed + Math.imul(sequence + 1, 2654435761) + Math.imul(salt + 1, 1597334677)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 2246822507);
  value ^= value >>> 13;
  value = Math.imul(value, 3266489909);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
};

const choose = (items, unit) => items[Math.min(items.length - 1, Math.floor(unit * items.length))];
const between = (minimum, maximum, unit) => minimum + (maximum - minimum) * unit;

const useMobileCanvas = () => {
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 700px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => setMobile(media.matches);
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  return mobile;
};

export default function EstateWildlife({ paused = false }) {
  const { condition, phase, season, settings, windy } = useEstateEnvironment();
  const [events, setEvents] = useState([]);
  const timersRef = useRef(new Set());
  const sequenceRef = useRef(0);
  const mobile = useMobileCanvas();
  const activity = normalizeWildlifeActivity(settings.wildlifeActivity, settings.wildlife);
  const qualityAllowsMotion = !["Off"].includes(settings.quality);
  const disabled = paused || settings.reducedMotion || activity === "Off" || !qualityAllowsMotion;
  const contextSeed = useMemo(
    () => hashText(`${condition}:${phase}:${season}:${activity}:${mobile ? "mobile" : "desktop"}`),
    [activity, condition, mobile, phase, season],
  );

  const eligibleWildlife = useMemo(
    () => estateWildlife.filter((wildlife) => isWildlifeEligible(
      wildlife,
      { condition, phase, season, windy },
    )),
    [condition, phase, season, windy],
  );

  useEffect(() => {
    const clearTimers = () => {
      for (const timer of timersRef.current) window.clearTimeout(timer);
      timersRef.current.clear();
    };
    clearTimers();
    setEvents([]);
    sequenceRef.current = 0;
    if (disabled || !eligibleWildlife.length) return clearTimers;

    let cancelled = false;
    const maxSimultaneous = mobile || activity === "Minimal" || settings.quality === "Minimal" ? 1 : 2;
    const sparseConditions = season === "winter" || ["snow", "heavy_snow", "fog", "cold"].includes(condition);

    const addTimer = (callback, delay) => {
      const timer = window.setTimeout(() => {
        timersRef.current.delete(timer);
        callback();
      }, delay);
      timersRef.current.add(timer);
    };

    const scheduleNext = (initial = false) => {
      if (cancelled) return;
      const sequence = sequenceRef.current;
      const baseRange = activity === "Minimal" || settings.quality === "Minimal"
        ? [45000, 75000]
        : [20000, 60000];
      const normalDelay = between(
        baseRange[0],
        baseRange[1],
        seededUnit(contextSeed, sequence, initial ? 1 : 2),
      ) / (sparseConditions ? .55 : 1);
      const delay = initial && import.meta.env.DEV
        ? between(1800, 3400, seededUnit(contextSeed, sequence, 7))
        : normalDelay;
      addTimer(spawnEvent, delay);
    };

    const spawnEvent = () => {
      if (cancelled || document.hidden) {
        scheduleNext(false);
        return;
      }
      const sequence = sequenceRef.current++;
      const weighted = eligibleWildlife.flatMap((wildlife) => {
        const weight = Math.max(.05, wildlife.seasonalWeight?.[season] ?? 1);
        return Array.from({ length:Math.max(1, Math.round(weight * 8)) }, () => wildlife);
      });
      const wildlife = choose(weighted, seededUnit(contextSeed, sequence, 3));
      const pathId = choose(wildlife.pathIds, seededUnit(contextSeed, sequence, 4));
      const path = wildlifePathPresets[pathId];
      const depth = path?.depth || choose(wildlife.depthLayers, seededUnit(contextSeed, sequence, 5));
      const duration = between(
        wildlife.minDuration,
        wildlife.maxDuration,
        seededUnit(contextSeed, sequence, 6),
      );
      const direction = path?.direction || "forward";
      const size = Math.round((wildlife.sizes[depth] || 24) * (mobile ? .82 : 1));
      const event = {
        ...wildlife,
        eventId:`${wildlife.id}-${contextSeed}-${sequence}`,
        pathId,
        depth,
        direction,
        duration,
        size,
      };

      setEvents((current) => {
        if (current.length >= maxSimultaneous || current.some(({ type }) => type === wildlife.type)) return current;
        return [...current, event];
      });
      addTimer(
        () => setEvents((current) => current.filter(({ eventId }) => eventId !== event.eventId)),
        duration * 1000 + 600,
      );
      scheduleNext(false);
    };

    scheduleNext(true);
    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [
    activity,
    condition,
    contextSeed,
    disabled,
    eligibleWildlife,
    mobile,
    season,
    settings.quality,
  ]);

  if (disabled || !eligibleWildlife.length) return null;

  return (
    <div
      className="js-estate-wildlife"
      aria-hidden="true"
      data-activity={activity.toLowerCase()}
      data-condition={condition}
      data-phase={phase}
      data-season={season}
    >
      {events.map((event) => (
        <span
          className={`js-wildlife-event is-${event.type} depth-${event.depth} path-${event.pathId} direction-${event.direction}`}
          key={event.eventId}
          data-species={event.species}
          style={{
            "--wildlife-duration":`${event.duration}s`,
            "--wildlife-size":`${event.size}px`,
          }}
        >
          <img src={event.asset} alt="" draggable="false" />
        </span>
      ))}
    </div>
  );
}
