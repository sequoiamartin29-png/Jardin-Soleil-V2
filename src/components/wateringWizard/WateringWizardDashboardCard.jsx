import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Droplets, Sparkles } from "lucide-react";
import WateringWizardCharacter from "./WateringWizardCharacter";
import "./WateringWizardDashboardCard.css";

export default function WateringWizardDashboardCard({ onOpen }){
  const reduceMotion=useReducedMotion();
  return <motion.article
    className="js-wizard-dashboard-card js-dashboard-panel"
    aria-labelledby="watering-wizard-card-title"
    initial={reduceMotion?false:{opacity:0,y:16}}
    whileInView={{opacity:1,y:0}}
    viewport={{once:true,amount:.25}}
    transition={{type:"spring",stiffness:135,damping:20}}
  >
    <div className="js-wizard-dashboard-card__art" aria-hidden="true"><WateringWizardCharacter expression="winking" size="small" /></div>
    <div className="js-wizard-dashboard-card__copy">
      <p><Droplets size={15} /> Your garden’s daily companion</p>
      <h2 id="watering-wizard-card-title">Meet your Watering Wizard</h2>
      <span>Weather, recent rain, and every plant’s needs—gently considered in one cheerful plan.</span>
      <button type="button" onClick={onOpen}>See Today’s Watering Plan <ArrowRight size={16} /></button>
    </div>
    <Sparkles className="js-wizard-dashboard-card__sparkle" size={24} aria-hidden="true" />
  </motion.article>;
}
