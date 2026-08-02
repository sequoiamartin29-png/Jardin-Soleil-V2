import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import wizardArtwork from "../../assets/watering-wizard/watering-wizard-transparent.png";
import "./WateringWizardCharacter.css";

export const WIZARD_EXPRESSIONS = {
  idle:{ label:"resting peacefully", tilt:0, lift:0, scale:1 },
  happy:{ label:"happy", tilt:0, lift:0, scale:1 },
  helping:{ label:"helping with today’s garden care", tilt:-.5, lift:-1, scale:1.005 },
  thinking:{ label:"thinking", tilt:-2.5, lift:1, scale:.99 },
  excited:{ label:"excited", tilt:1.5, lift:-4, scale:1.025 },
  winking:{ label:"cheerful", tilt:2, lift:0, scale:1.01 },
  concerned:{ label:"concerned about thirsty plants", tilt:-1.5, lift:2, scale:.985 },
  celebrating:{ label:"celebrating", tilt:2.5, lift:-5, scale:1.035 },
  watering:{ label:"ready to help with watering", tilt:1, lift:-1, scale:1.01 },
  "checking-weather":{ label:"checking the weather", tilt:-2, lift:0, scale:1 },
  "magic-sparkle":{ label:"making a little garden magic", tilt:1, lift:-3, scale:1.02 },
  cheering:{ label:"cheering you on", tilt:-1, lift:-5, scale:1.03 },
};

export default function WateringWizardCharacter({ expression="happy", size="large", className="" }){
  const reduceMotion=useReducedMotion();
  const mood=WIZARD_EXPRESSIONS[expression]||WIZARD_EXPRESSIONS.happy;
  const idle=reduceMotion?{}:{
    y:[0,-4,0],
    rotate:[-.55,.55,-.55],
    scale:[1,1.006,1],
  };
  return <motion.figure
    className={`js-wizard-character js-wizard-character--${size} js-wizard-character--${expression} ${className}`.trim()}
    data-wizard-expression={expression}
    role="img"
    aria-label={`The Watering Wizard is ${mood.label}.`}
    initial={reduceMotion?false:{opacity:0,scale:.93,y:12}}
    animate={{opacity:1,scale:mood.scale,y:mood.lift,rotate:mood.tilt}}
    transition={{type:"spring",stiffness:165,damping:19,mass:.8}}
  >
    <span className="js-wizard-character__ground-shadow" aria-hidden="true" />
    <motion.div
      className="js-wizard-character__float"
      animate={idle}
      transition={reduceMotion?{duration:0}:{duration:5.6,repeat:Infinity,ease:"easeInOut"}}
    >
      <img src={wizardArtwork} alt="" draggable="false" />
      <span className="js-wizard-character__staff-glow" aria-hidden="true" />
    </motion.div>
  </motion.figure>;
}
