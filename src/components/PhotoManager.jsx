import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import EstatePage from "./EstatePage";
import PlantSelectorWithCreate from "./PlantSelectorWithCreate";

export default function PhotoManager() {
  const { plants, photos, addPhotos, deletePhoto } = useGarden();
  const [selectedPlant, setSelectedPlant] = useState("");
  const filteredPhotos = useMemo(() => selectedPlant ? photos.filter((photo) => photo.plantId === selectedPlant) : photos, [photos, selectedPlant]);
  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    const newPhotos = await Promise.all(files.map((file, index) => new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve({ id:`${Date.now()}-${index}`, plantId:selectedPlant || null, name:file.name, date:new Date().toISOString(), url:reader.result }); reader.readAsDataURL(file); })));
    addPhotos(newPhotos); event.target.value = "";
  };
  const plantName = (plantId) => plants.find((plant) => plant.id === plantId)?.name || "Unassigned estate photo";
  return <EstatePage id="photo-manager-title" title="Photo Manager" description="Preserve estate memories and connect each image to a stable plant record." icon="flower" theme="journal">
    <div className="js-estate-panel js-estate-form">
      <PlantSelectorWithCreate label="Plant album" value={selectedPlant} onChange={(plantId) => setSelectedPlant(plantId)} emptyLabel="All plant albums" description="Filter by plant, or create a missing plant before uploading." />
      <label>Upload photographs<input type="file" multiple accept="image/*" onChange={handleUpload} /></label>
    </div>
    {filteredPhotos.length ? <div className="js-estate-grid" style={{marginTop:"22px"}}>{filteredPhotos.map((photo) => <article className="js-estate-card" key={photo.id}><img src={photo.url || photo.src} alt={photo.name || `Garden photograph for ${plantName(photo.plantId)}`} style={{aspectRatio:"4/3",borderRadius:"14px",objectFit:"cover",width:"100%"}} /><span className="js-estate-kicker">{plantName(photo.plantId)}</span><h2 style={{fontFamily:"Georgia,serif",color:"#52623f"}}>{photo.name || "Garden memory"}</h2><p>{new Date(photo.date || photo.createdAt).toLocaleDateString()}</p><button className="js-estate-button is-danger" type="button" onClick={() => deletePhoto(photo.id)}>Delete Photo</button></article>)}</div> : <p className="js-estate-empty">No photographs match this plant album. Choose or create a plant, then add the first estate memory.</p>}
  </EstatePage>;
}
