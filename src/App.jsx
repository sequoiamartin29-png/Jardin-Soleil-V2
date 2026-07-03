import React, { useState } from "react";

import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Orchard from "./components/Orchard";
import Garden from "./components/Garden";
import Logbook from "./components/Logbook";
import Gallery from "./components/Gallery";
import Inventory from "./components/Inventory";
import Weather from "./components/Weather";
import Learning from "./components/Learning";
import WordSearch from "./components/WordSearch";
import PlantDirectory from "./components/PlantDirectory";
import PlantProfile from "./components/PlantProfile";
import "./styles/app.css";

export default function App() {

  const [page, setPage] = useState("Dashboard");
const [selectedPlant, setSelectedPlant] = useState(null);
  const renderPage = () => {

    switch (page) {

      case "Dashboard":
        return <Dashboard />;

      case "Orchard":
        return <Orchard />;

      case "Garden":
        return <Garden />;

      case "Logbook":
        return <Logbook />;

      case "Gallery":
        return <Gallery />;

      case "Inventory":
        return <Inventory />;

      case "Weather":
        return <Weather />;
case "Learning":
  return <Learning />;

case "Word Search":
  return <WordSearch />;
        case "Plant Directory":
  return (
    <PlantDirectory
      onSelectPlant={(plant) => {
        setSelectedPlant(plant);
        setPage("Plant Profile");
      }}
    />
  );

case "Plant Profile":
  return <PlantProfile plant={selectedPlant} />;
      default:
        return <Dashboard />;
    }

  };

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#F8F2EB",
        padding: "30px",
        fontFamily: "Georgia, serif"
      }}
    >
            <header
        style={{
          background: "#FFFDF9",
          borderRadius: "28px",
          padding: "28px",
          marginBottom: "28px",
          border: "1px solid #EFE5D8",
          boxShadow: "0 12px 28px rgba(0,0,0,.08)"
        }}
      >
        <h1
          style={{
            margin: 0,
            color: "#5D6B46",
            fontSize: "46px"
          }}
        >
          🌿 Jardin Soleil
        </h1>

        <p
          style={{
            margin: "10px 0 0",
            color: "#777",
            fontSize: "18px"
          }}
        >
          French Chalet Garden Command Center
        </p>
      </header>

      <Navigation activePage={page} setPage={setPage} />
            <main>
        {renderPage()}
      </main>
    </div>
  );
}
