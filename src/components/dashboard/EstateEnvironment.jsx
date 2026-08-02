import React from "react";
import AnimatedWeather from "../weather/AnimatedWeather";

export default function EstateEnvironment({ paused=false }) {
  return <AnimatedWeather paused={paused} surface="garden"/>;
}
