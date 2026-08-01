import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import wizardArtwork from "../../assets/watering-wizard/watering-wizard.png";
import "./WateringWizardCharacter.css";

export const WIZARD_EXPRESSIONS = {
  happy:{ label:"happy", tilt:0, lift:0, scale:1 },
  thinking:{ label:"thinking", tilt:-2.5, lift:1, scale:.99 },
  excited:{ label:"excited", tilt:1.5, lift:-4, scale:1.025 },
  winking:{ label:"winking", tilt:2, lift:0, scale:1.01 },
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
    y:[0,-7,0],
    rotate:[-1,1,-1],
    scale:[1,1.012,1],
  };
  return <motion.figure
    className={`js-wizard-character js-wizard-character--${size} js-wizard-character--${expression} ${className}`.trim()}
    role="img"
    aria-label={`The Watering Wizard is ${mood.label}.`}
    initial={reduceMotion?false:{opacity:0,scale:.93,y:12}}
    animate={{opacity:1,scale:mood.scale,y:mood.lift,rotate:mood.tilt}}
    transition={{type:"spring",stiffness:165,damping:19,mass:.8}}
  >
    <motion.div
      className="js-wizard-character__float"
      animate={idle}
      transition={reduceMotion?{duration:0}:{duration:4.8,repeat:Infinity,ease:"easeInOut"}}
    >
      <img src={wizardArtwork} alt="" draggable="false" />
      <span className="js-wizard-character__staff-glow" aria-hidden="true" />
      <span className="js-wizard-character__idle-blink" aria-hidden="true"><i/><i/></span>
      <AnimatePresence>
        {expression==="winking"&&<motion.span className="js-wizard-character__wink" initial={{scaleX:0}} animate={{scaleX:1}} exit={{scaleX:0}} transition={{type:"spring",stiffness:320,damping:20}} aria-hidden="true" />}
      </AnimatePresence>
      <span className="js-wizard-character__breath" aria-hidden="true" />
    </motion.div>
    <div className="js-wizard-character__sparkles" aria-hidden="true">
      {[0,1,2,3].map((sparkle)=><span key={sparkle} />)}
    </div>
  </motion.figure>;
}
