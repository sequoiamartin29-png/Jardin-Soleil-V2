import React from "react";
import Dashboard from "./components/Dashboard";
import "./styles/app.css";

export default function App() {
  return (
    <div className="app">
      <h1>🌿 Jardin Soleil</h1>
      <p>French Chalet Garden Command Center</p>

      <Dashboard />
    </div>
  );
}
