import React from "react";

import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Orchard from "./components/Orchard";
import Garden from "./components/Garden";
import Logbook from "./components/Logbook";
import Gallery from "./components/Gallery";
import Inventory from "./components/Inventory";

import "./styles/app.css";

export default function App() {
  return (
    <div
      style={{
        background: "#F8F2EB",
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Georgia, serif"
      }}
    >
      <Navigation />

      <Dashboard />

      <Orchard />

      <Garden />

      <Logbook />

      <Gallery />

      <Inventory />
          </div>
  );
}
