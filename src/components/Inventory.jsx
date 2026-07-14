import React, { useMemo, useState } from "react";
import { useGarden } from "../context/GardenContext";
import BotanicalIcon from "./icons/BotanicalIcon";
import EstatePage from "./EstatePage";
import "./Inventory.css";

const blank = { name:"", category:"Soil", quantity:"", unit:"", status:"In stock", location:"", lowThreshold:"", notes:"" };
const statuses = ["In stock", "Low", "Out", "Not counted"];

export default function Inventory() {
  const { inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useGarden();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [query, setQuery] = useState("");
  const categories = useMemo(() => [...new Set(["Soil", "Pots & Grow Bags", "Fertilizer", "Mulch & Support", "Tools", "Tea Pantry", "Harvest Storage", ...inventoryItems.map((item) => item.category)])].sort(), [inventoryItems]);
  const visible = inventoryItems.filter((item) => `${item.name} ${item.category} ${item.status} ${item.location} ${item.notes}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const startAdd = () => { setEditing("new"); setForm(blank); setError(""); };
  const startEdit = (item) => { setEditing(item.id); setForm({ ...item }); setError(""); };
  const change = (field, value) => { setForm((current) => ({ ...current, [field]:value })); setError(""); };
  const save = (event) => {
    event.preventDefault();
    if (!form.name.trim()) { setError("Item name is required."); return; }
    if (form.quantity !== "" && Number(form.quantity) < 0) { setError("Quantity cannot be negative."); return; }
    if (form.lowThreshold !== "" && Number(form.lowThreshold) < 0) { setError("Low-stock threshold cannot be negative."); return; }
    try {
      if (editing === "new") addInventoryItem(form); else updateInventoryItem(editing, form);
      setEditing(null); setForm(blank);
    } catch (nextError) { setError(nextError.message); }
  };
  const mark = (item, status) => updateInventoryItem(item.id, { status, ...(status === "Out" ? { quantity:0 } : {}) });
  const lowCount = inventoryItems.filter((item) => item.status === "Low" || item.status === "Out" || (item.quantity !== "" && item.lowThreshold !== "" && Number(item.quantity) <= Number(item.lowThreshold))).length;
  return (
    <EstatePage id="inventory-title" title="Garden Inventory" description="A persistent estate ledger for tools, growing supplies, harvest storage, and the Tea Apothecary pantry." icon="container-plant" actions={<button className="js-estate-button is-primary" type="button" onClick={startAdd}>Add Inventory Item</button>}>
      <div className="js-estate-toolbar"><label className="js-inventory-search">Search inventory<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label><span className={`js-estate-badge${lowCount ? "" : " is-gold"}`}>{lowCount} low or out · {inventoryItems.length} records</span></div>
      {editing && <InventoryForm form={form} categories={categories} error={error} change={change} onSubmit={save} onCancel={() => setEditing(null)} title={editing === "new" ? "Add inventory item" : `Edit ${form.name}`} />}
      {visible.length ? <div className="js-inventory-grid">{visible.map((item) => {
        const computedLow = item.quantity !== "" && item.lowThreshold !== "" && Number(item.quantity) <= Number(item.lowThreshold);
        const status = item.status === "In stock" && computedLow ? "Low" : item.status;
        return <article className="js-estate-card js-inventory-card" key={item.id}><header><BotanicalIcon type={item.category === "Tea Pantry" ? "tea" : item.category === "Fertilizer" ? "herb" : "container-plant"} size="md" decorative /><div><p>{item.category}</p><h2>{item.name}</h2></div><span className={`js-estate-badge is-${status.toLocaleLowerCase().replace(/\s+/g, "-")}`}>{status}</span></header><dl><div><dt>Quantity</dt><dd>{item.quantity === "" ? "Not counted" : `${item.quantity}${item.unit ? ` ${item.unit}` : ""}`}</dd></div><div><dt>Low threshold</dt><dd>{item.lowThreshold === "" ? "Not set" : item.lowThreshold}</dd></div><div><dt>Location</dt><dd>{item.location || "Not recorded"}</dd></div></dl>{item.notes && <p>{item.notes}</p>}<div className="js-inventory-card__actions"><button type="button" onClick={() => startEdit(item)}>Edit</button><button type="button" onClick={() => startEdit(item)}>Adjust Quantity</button><button type="button" onClick={() => mark(item, "Low")}>Mark Low</button><button type="button" onClick={() => mark(item, "Out")}>Mark Out</button><button className="is-danger" type="button" onClick={() => setDeleting(item)}>Delete</button></div>{deleting?.id === item.id && <div className="js-estate-confirm" role="alert"><strong>Delete {item.name}?</strong><p>This removes the inventory record only. Plant and recipe records remain intact.</p><div className="js-estate-confirm__actions"><button className="js-estate-button" type="button" onClick={() => setDeleting(null)}>Cancel</button><button className="js-estate-button is-danger" type="button" onClick={() => { deleteInventoryItem(item.id); setDeleting(null); }}>Confirm Delete</button></div></div>}</article>;
      })}</div> : <p className="js-estate-empty">No inventory records match this search. Add a supply or clear the search to restore the full estate ledger.</p>}
    </EstatePage>
  );
}

function InventoryForm({ form, categories, error, change, onSubmit, onCancel, title }) {
  return <form className="js-estate-panel js-estate-form js-inventory-form" onSubmit={onSubmit} noValidate><h2>{title}</h2><label>Item name<input autoFocus value={form.name} onChange={(event) => change("name", event.target.value)} required /></label><label>Category<select value={form.category} onChange={(event) => change("category", event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Quantity<input type="number" min="0" step="any" value={form.quantity} onChange={(event) => change("quantity", event.target.value)} /></label><label>Unit<input value={form.unit} onChange={(event) => change("unit", event.target.value)} placeholder="bags, oz, jars…" /></label><label>Status<select value={form.status} onChange={(event) => change("status", event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label>Location<input value={form.location} onChange={(event) => change("location", event.target.value)} /></label><label>Low-stock threshold<input type="number" min="0" step="any" value={form.lowThreshold} onChange={(event) => change("lowThreshold", event.target.value)} /></label><label className="is-wide">Notes<textarea rows="3" value={form.notes} onChange={(event) => change("notes", event.target.value)} /></label>{error && <p className="js-inventory-form__error" role="alert">{error}</p>}<div className="js-inventory-form__actions"><button className="js-estate-button" type="button" onClick={onCancel}>Cancel</button><button className="js-estate-button is-primary" type="submit">Save Inventory</button></div></form>;
}
