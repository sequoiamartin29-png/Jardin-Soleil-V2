import React, { useMemo, useState } from "react";
import BotanicalIcon from "./icons/BotanicalIcon";
import { useGarden } from "../context/GardenContext";
import PlantSelectorWithCreate from "./PlantSelectorWithCreate";
import TeaWorkflow from "./TeaWorkflow";
import EstatePage from "./EstatePage";
import "./TeaApothecary.css";
import "./TeaRecipe.css";

const ingredientName = (ingredient) => typeof ingredient === "string" ? ingredient : ingredient.name;
const ingredientAmount = (ingredient) => typeof ingredient === "object" ? ingredient.amount || "" : "";
const ingredientLabel = (ingredient) => {
  const amount = ingredientAmount(ingredient);
  return `${ingredientName(ingredient)}${amount ? ` - ${amount}` : ""}`;
};
const list = (value) => String(value || "").split(/\n|,/).map((item) => item.trim()).filter(Boolean);
const unique = (items) => [...new Set(items.filter(Boolean))];
const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});
const textToIngredients = (value) => String(value || "")
  .split("\n")
  .map((line) => {
    const [name, ...amount] = line.split("|");
    return { name:name.trim(), amount:amount.join("|").trim() };
  })
  .filter((item) => item.name);
const ingredientsToText = (ingredients = [], linkedNames = new Set()) => ingredients
  .filter((ingredient) => !linkedNames.has(ingredientName(ingredient).toLocaleLowerCase()))
  .map((ingredient) => `${ingredientName(ingredient)}${ingredientAmount(ingredient) ? ` | ${ingredientAmount(ingredient)}` : ""}`)
  .join("\n");
const searchableRecipe = (blend, linkedPlants = []) => [
  blend.name,
  blend.description,
  blend.subtitle,
  blend.blendCategory,
  blend.wellnessCategory,
  blend.caffeineLevel,
  blend.seasonalAvailability,
  blend.notes,
  ...(blend.ingredients || []).map(ingredientName),
  ...(blend.flavorProfile || []),
  ...(blend.wellnessBenefits || []),
  ...linkedPlants.map((plant) => plant?.name || ""),
].join(" ").toLocaleLowerCase();

const blankRecipe = {
  name:"",
  description:"",
  blendCategory:"",
  flavorProfile:"",
  wellnessCategory:"",
  wellnessBenefits:"",
  caffeineLevel:"None",
  linkedPlantIds:[],
  ingredientAmounts:{},
  freeIngredients:"",
  steepTime:"",
  temperature:"",
  infusions:"",
  serving:"",
  seasonalAvailability:"",
  notes:"",
  inventoryQuantity:"",
  inventoryUnit:"servings",
  harvestStatus:"Not recorded",
  iconType:"tea",
  favorite:false,
  photo:"",
};

const toForm = (blend, plants) => {
  const linkedPlantIds = Array.isArray(blend.linkedPlantIds) ? blend.linkedPlantIds : [];
  const linkedNames = new Set(linkedPlantIds
    .map((id) => plants.find((plant) => plant.id === id)?.name)
    .filter(Boolean)
    .map((name) => name.toLocaleLowerCase()));
  const ingredientAmounts = {};
  linkedPlantIds.forEach((id) => {
    const plant = plants.find((item) => item.id === id);
    const ingredient = plant ? (blend.ingredients || []).find((item) => ingredientName(item).toLocaleLowerCase() === plant.name.toLocaleLowerCase()) : null;
    ingredientAmounts[id] = ingredientAmount(ingredient);
  });
  return {
    name:blend.name || "",
    description:blend.description || blend.subtitle || "",
    blendCategory:blend.blendCategory || "",
    flavorProfile:(blend.flavorProfile || []).join(", "),
    wellnessCategory:blend.wellnessCategory || "",
    wellnessBenefits:(blend.wellnessBenefits || []).join("\n"),
    caffeineLevel:blend.caffeineLevel || "None",
    linkedPlantIds,
    ingredientAmounts,
    freeIngredients:ingredientsToText(blend.ingredients || [], linkedNames),
    steepTime:blend.brewing?.steepTime || "",
    temperature:blend.brewing?.temperature || "",
    infusions:blend.brewing?.infusions || "",
    serving:blend.brewing?.serving || "",
    seasonalAvailability:blend.seasonalAvailability || "",
    notes:blend.notes || "",
    inventoryQuantity:blend.inventory?.quantity ?? "",
    inventoryUnit:blend.inventory?.unit || "servings",
    harvestStatus:blend.harvestStatus || "Not recorded",
    iconType:blend.iconType || "tea",
    favorite:Boolean(blend.favorite),
    photo:blend.photo || "",
  };
};

export default function TeaApothecary({ onNavigate, onConsultHerbalist }) {
  const { teaRecipes, addTeaRecipe, updateTeaRecipe, deleteTeaRecipe, duplicateTeaRecipe, inventoryItems, activePlants, plants } = useGarden();
  const [selectedBlendId, setSelectedBlendId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankRecipe);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(null);
  const selectedBlend = teaRecipes.find((blend) => blend.id === selectedBlendId);
  const pantry = inventoryItems.filter((item) => /tea|herb|jar|harvest/i.test(`${item.category} ${item.name}`));
  const teaPlants = activePlants.filter((plant) => /tea|herb|mint|sage|chamomile|balm/i.test(`${plant.category} ${plant.type} ${plant.group}`));
  const activeRecipes = teaRecipes.filter((item) => !item.archived);
  const visible = useMemo(() => teaRecipes.filter((blend) => {
    if (filter === "Favorites" && !blend.favorite) return false;
    if (filter === "Archived" ? !blend.archived : blend.archived) return false;
    const linked = (blend.linkedPlantIds || []).map((id) => plants.find((plant) => plant.id === id)).filter(Boolean);
    return searchableRecipe(blend, linked).includes(query.trim().toLocaleLowerCase());
  }), [teaRecipes, filter, query, plants]);

  const startAdd = () => { setEditing("new"); setForm(blankRecipe); setSelectedBlendId(null); };
  const startEdit = (blend) => { setEditing(blend.id); setForm(toForm(blend, plants)); setSelectedBlendId(null); };
  const save = async (event) => {
    event.preventDefault();
    const linkedIngredients = form.linkedPlantIds.map((plantId) => {
      const plant = plants.find((item) => item.id === plantId);
      return plant ? { name:plant.name, amount:form.ingredientAmounts?.[plantId] || "" } : null;
    }).filter(Boolean);
    const ingredients = [...linkedIngredients, ...textToIngredients(form.freeIngredients)];
    if (!form.name.trim() || !ingredients.length) return;
    const recipe = {
      name:form.name.trim(),
      description:form.description.trim(),
      subtitle:form.description.trim(),
      blendCategory:form.blendCategory.trim(),
      ingredients,
      linkedPlantIds:form.linkedPlantIds,
      flavorProfile:list(form.flavorProfile),
      wellnessCategory:form.wellnessCategory.trim(),
      wellnessBenefits:list(form.wellnessBenefits),
      caffeineLevel:form.caffeineLevel,
      brewing:{
        steepTime:form.steepTime.trim(),
        temperature:form.temperature.trim(),
        infusions:String(form.infusions || "").trim(),
        serving:form.serving.trim(),
      },
      seasonalAvailability:form.seasonalAvailability.trim(),
      notes:form.notes.trim(),
      inventory:{ quantity:form.inventoryQuantity === "" ? "" : Number(form.inventoryQuantity), unit:form.inventoryUnit.trim() },
      harvestStatus:form.harvestStatus.trim() || "Not recorded",
      iconType:form.iconType || "tea",
      favorite:form.favorite,
      photo:form.photo,
    };
    if (editing === "new") addTeaRecipe(recipe); else updateTeaRecipe(editing, recipe);
    setEditing(null);
    setForm(blankRecipe);
  };

  if (selectedBlend) return <TeaBlendProfile blend={selectedBlend} plants={plants} onBack={() => setSelectedBlendId(null)} onEdit={() => startEdit(selectedBlend)} />;
  return (
    <EstatePage id="apothecary-title" title="Tea Apothecary" description="Estate-grown recipes, herbal ingredients, pantry records, and journeys from garden to cup." icon="tea" className="js-apothecary" actions={<button className="js-estate-button" type="button" onClick={onConsultHerbalist}>Consult the Herbalist</button>}>
      <button className="js-apothecary__back" type="button" onClick={() => onNavigate?.("Learning")}>Back to Learning Center</button>
      <div className="js-apothecary__summary-grid"><article className="js-estate-card"><span>Estate Recipe Book</span><strong>{activeRecipes.length}</strong><p>active recipes</p></article><article className="js-estate-card"><span>Favorites</span><strong>{teaRecipes.filter((item) => item.favorite && !item.archived).length}</strong><p>treasured blends</p></article><article className="js-estate-card"><span>Herbal Ingredients</span><strong>{teaPlants.length}</strong><p>available plant records</p></article><article className="js-estate-card"><span>Pantry</span><strong>{pantry.length}</strong><p>inventory records</p></article></div>
      <section className="js-recipe-book" aria-labelledby="recipe-book-title">
        <div className="js-estate-toolbar"><div className="js-apothecary__section-heading"><p>Antique Botanical Journal</p><h2 id="recipe-book-title">Estate Recipe Book</h2><span>Create, edit, favorite, archive, and preserve Jardin Soleil recipes from the same saved collection used by the Tea Blend Library and Herbalist.</span></div><button className="js-estate-button is-primary" type="button" onClick={startAdd}>+ Add Estate Recipe</button></div>
        <div className="js-estate-toolbar"><div className="js-apothecary__filters" role="group" aria-label="Filter estate recipes">{["All", "Favorites", "Archived"].map((item) => <button className={`js-estate-button${filter === item ? " is-primary" : ""}`} type="button" key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="js-apothecary__search">Search recipes<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
        {editing && <TeaRecipeForm form={form} setForm={setForm} title={editing === "new" ? "New Estate Recipe" : `Edit ${form.name}`} onSubmit={save} onCancel={() => setEditing(null)} />}
        {visible.length ? <div className="js-apothecary__blend-grid">{visible.map((blend) => <TeaBlendCard key={blend.id} blend={blend} onOpen={() => setSelectedBlendId(blend.id)} onEdit={() => startEdit(blend)} onDuplicate={() => duplicateTeaRecipe(blend.id)} onFavorite={() => updateTeaRecipe(blend.id, { favorite:!blend.favorite })} onArchive={() => updateTeaRecipe(blend.id, { archived:!blend.archived })} onDelete={() => setDeleting(blend)} deleting={deleting?.id === blend.id} cancelDelete={() => setDeleting(null)} confirmDelete={() => { deleteTeaRecipe(blend.id); setDeleting(null); }} />)}</div> : <p className="js-estate-empty">No estate recipes match this view. Add a recipe or choose another filter.</p>}
      </section>
      <section className="js-tea-library" aria-labelledby="blend-library-title"><div className="js-apothecary__section-heading"><p>Tea Blend Library</p><h2 id="blend-library-title">Saved Blends</h2><span>The library reads from the Estate Recipe Book, so saved recipe changes appear here automatically.</span></div><div className="js-tea-library__list">{activeRecipes.slice(0, 6).map((blend) => <button key={blend.id} type="button" onClick={() => setSelectedBlendId(blend.id)}><BotanicalIcon type={blend.iconType || "tea"} size="sm" decorative /><span>{blend.name}</span></button>)}</div></section>
      <TeaWorkflow blends={activeRecipes} />
    </EstatePage>
  );
}

function TeaRecipeForm({ form, setForm, title, onSubmit, onCancel }) {
  const { plants } = useGarden();
  const [ingredientPick, setIngredientPick] = useState("");
  const linkedPlants = form.linkedPlantIds.map((id) => plants.find((plant) => plant.id === id)).filter(Boolean);
  const change = (field, value) => setForm((current) => ({ ...current, [field]:value }));
  const addIngredient = (plantId) => {
    if (!plantId) return;
    setForm((current) => ({
      ...current,
      linkedPlantIds:unique([...(current.linkedPlantIds || []), plantId]),
      ingredientAmounts:{ ...(current.ingredientAmounts || {}), [plantId]:current.ingredientAmounts?.[plantId] || "" },
    }));
    setIngredientPick("");
  };
  const removeIngredient = (plantId) => setForm((current) => {
    const nextAmounts = { ...(current.ingredientAmounts || {}) };
    delete nextAmounts[plantId];
    return { ...current, linkedPlantIds:(current.linkedPlantIds || []).filter((id) => id !== plantId), ingredientAmounts:nextAmounts };
  });
  const updateAmount = (plantId, amount) => setForm((current) => ({ ...current, ingredientAmounts:{ ...(current.ingredientAmounts || {}), [plantId]:amount } }));
  const photoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    change("photo", await fileToDataUrl(file));
  };
  return <form className="js-estate-panel js-estate-form js-tea-recipe-form" onSubmit={onSubmit}>
    <h2>{title}</h2>
    <label>Recipe Name<input autoFocus required value={form.name} onChange={(event) => change("name", event.target.value)} /></label>
    <label>Blend Category<input value={form.blendCategory} onChange={(event) => change("blendCategory", event.target.value)} placeholder="Morning tonic, evening tisane" /></label>
    <label className="is-wide">Description<textarea rows="2" value={form.description} onChange={(event) => change("description", event.target.value)} /></label>
    <label>Flavor Profile<input value={form.flavorProfile} onChange={(event) => change("flavorProfile", event.target.value)} placeholder="citrus, floral, cooling" /></label>
    <label>Wellness Category<input value={form.wellnessCategory} onChange={(event) => change("wellnessCategory", event.target.value)} placeholder="Calming, digestive, seasonal" /></label>
    <label>Caffeine Level<select value={form.caffeineLevel} onChange={(event) => change("caffeineLevel", event.target.value)}>{["None", "Low", "Moderate", "High"].map((item) => <option key={item}>{item}</option>)}</select></label>
    <div className="js-tea-recipe-form__ingredients is-wide">
      <PlantSelectorWithCreate value={ingredientPick} onChange={addIngredient} label="Ingredients" emptyLabel="Search saved herbs or create a new ingredient" expectedCollection="Herb & Tea Garden" description="Link saved herbs from the canonical plant database." createLabel="+ Create New Ingredient" createTitle="Create New Ingredient" />
      {linkedPlants.length ? <div className="js-tea-recipe-form__ingredient-list">{linkedPlants.map((plant) => <div key={plant.id} className="js-tea-recipe-form__ingredient-row"><BotanicalIcon plant={plant} size="sm" decorative /><strong>{plant.name}</strong><input aria-label={`${plant.name} amount`} value={form.ingredientAmounts?.[plant.id] || ""} onChange={(event) => updateAmount(plant.id, event.target.value)} placeholder="Amount" /><button type="button" onClick={() => removeIngredient(plant.id)}>Remove</button></div>)}</div> : <p className="js-estate-empty">No saved herb ingredients linked yet.</p>}
    </div>
    <label className="is-wide">Additional Ingredients and Ingredient Amounts <small>One per line: Ingredient | amount</small><textarea rows="4" value={form.freeIngredients} onChange={(event) => change("freeIngredients", event.target.value)} /></label>
    <label>Brewing Temperature<input value={form.temperature} onChange={(event) => change("temperature", event.target.value)} /></label>
    <label>Steep Time<input value={form.steepTime} onChange={(event) => change("steepTime", event.target.value)} /></label>
    <label>Number of Infusions<input type="number" min="0" value={form.infusions} onChange={(event) => change("infusions", event.target.value)} /></label>
    <label>Serving Guidance<input value={form.serving} onChange={(event) => change("serving", event.target.value)} /></label>
    <label>Seasonal Availability<input value={form.seasonalAvailability} onChange={(event) => change("seasonalAvailability", event.target.value)} /></label>
    <label>Harvest Status<input value={form.harvestStatus} onChange={(event) => change("harvestStatus", event.target.value)} /></label>
    <label className="is-wide">Wellness Benefits<textarea rows="3" value={form.wellnessBenefits} onChange={(event) => change("wellnessBenefits", event.target.value)} /></label>
    <label>Inventory<input type="number" min="0" value={form.inventoryQuantity} onChange={(event) => change("inventoryQuantity", event.target.value)} /></label>
    <label>Inventory Unit<input value={form.inventoryUnit} onChange={(event) => change("inventoryUnit", event.target.value)} /></label>
    <label>Photo (optional)<input type="file" accept="image/*" onChange={photoChange} /></label>
    <label className="is-wide">Personal Notes<textarea rows="3" value={form.notes} onChange={(event) => change("notes", event.target.value)} /></label>
    <label className="js-tea-recipe-form__favorite"><input type="checkbox" checked={form.favorite} onChange={(event) => change("favorite", event.target.checked)} /> Favorite</label>
    <div className="js-tea-recipe-form__actions"><button className="js-estate-button" type="button" onClick={onCancel}>Cancel</button><button className="js-estate-button is-primary" type="submit">Save Recipe</button></div>
  </form>;
}

function TeaBlendCard({ blend, onOpen, onEdit, onDuplicate, onFavorite, onArchive, onDelete, deleting, cancelDelete, confirmDelete }) {
  const isAvailable = Number(blend.inventory?.quantity || 0) > 0;
  return <article className="js-tea-card">
    <div className="js-tea-card__top">{blend.photo ? <img src={blend.photo} alt="" /> : <BotanicalIcon type={blend.iconType} size="lg" decorative />}<span className={isAvailable ? "is-ready" : "is-waiting"}>{blend.harvestStatus}</span></div>
    <h3>{blend.name}</h3>
    <p className="js-tea-card__subtitle">{blend.description || blend.subtitle || "No description recorded."}</p>
    <dl><div><dt>Category</dt><dd>{blend.blendCategory || "Not recorded"}</dd></div><div><dt>Ingredients</dt><dd>{blend.ingredients.map(ingredientLabel).join(" - ")}</dd></div><div><dt>Flavor</dt><dd>{blend.flavorProfile.join(" - ") || "Not recorded"}</dd></div><div><dt>Wellness</dt><dd>{blend.wellnessCategory || blend.wellnessBenefits?.join(" - ") || "Not recorded"}</dd></div><div><dt>Brewing</dt><dd>{[blend.brewing?.temperature, blend.brewing?.steepTime, blend.brewing?.infusions ? `${blend.brewing.infusions} infusions` : ""].filter(Boolean).join(" - ") || "Not recorded"}</dd></div><div><dt>Inventory</dt><dd>{blend.inventory?.quantity === "" ? "Not counted" : `${blend.inventory?.quantity || 0} ${blend.inventory?.unit || ""}`}</dd></div></dl>
    <div className="js-tea-card__actions"><button type="button" onClick={onOpen}>View</button><button type="button" onClick={onEdit}>Edit</button><button type="button" onClick={onDuplicate}>Duplicate</button><button type="button" aria-pressed={blend.favorite} onClick={onFavorite}>{blend.favorite ? "Unfavorite" : "Favorite"}</button><button type="button" onClick={onArchive}>{blend.archived ? "Restore" : "Archive"}</button><button className="is-danger" type="button" onClick={onDelete}>Delete</button></div>
    {deleting && <div className="js-estate-confirm" role="alert"><strong>Delete {blend.name}?</strong><p>This removes the recipe. Linked plant records are never deleted.</p><div className="js-estate-confirm__actions"><button className="js-estate-button" type="button" onClick={cancelDelete}>Cancel</button><button className="js-estate-button is-danger" type="button" onClick={confirmDelete}>Confirm Delete</button></div></div>}
  </article>;
}

function TeaBlendProfile({ blend, plants, onBack, onEdit }) {
  const linkedPlants = (blend.linkedPlantIds || []).map((id) => plants.find((plant) => plant.id === id)).filter(Boolean);
  return <EstatePage id="tea-blend-title" title={blend.name} eyebrow="Jardin Soleil - Estate Recipe" description={blend.description || blend.subtitle} icon={blend.iconType || "tea"} className="js-tea-profile" actions={<button className="js-estate-button is-primary" type="button" onClick={onEdit}>Edit Recipe</button>}>
    <button className="js-apothecary__back" type="button" onClick={onBack}>Back to Estate Recipe Book</button>
    {blend.photo && <img className="js-tea-profile__photo" src={blend.photo} alt="" />}
    <div className="js-tea-profile__grid"><article><h2>Botanical ingredients</h2><ul>{blend.ingredients.map((ingredient, index) => <li key={`${ingredientName(ingredient)}-${index}`}>{ingredientLabel(ingredient)}</li>)}</ul>{linkedPlants.length > 0 && <div className="js-tea-profile__linked">{linkedPlants.map((plant) => <span key={plant.id}>{plant.name}</span>)}</div>}<p className="js-tea-profile__status">{blend.harvestStatus}</p></article><article><h2>Flavor profile</h2><div className="js-tea-profile__tags">{blend.flavorProfile.map((flavor) => <span key={flavor}>{flavor}</span>)}</div><h3>Seasonal availability</h3><p>{blend.seasonalAvailability || "Not recorded"}</p></article><article><h2>Wellness traditions</h2><p><strong>Category:</strong> {blend.wellnessCategory || "Not recorded"}</p><ul>{blend.wellnessBenefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul><p><strong>Caffeine:</strong> {blend.caffeineLevel}</p></article><article><h2>Brewing instructions</h2><dl><div><dt>Water</dt><dd>{blend.brewing?.temperature || "Not recorded"}</dd></div><div><dt>Steep</dt><dd>{blend.brewing?.steepTime || "Not recorded"}</dd></div><div><dt>Infusions</dt><dd>{blend.brewing?.infusions || "Not recorded"}</dd></div><div><dt>Measure</dt><dd>{blend.brewing?.serving || "Not recorded"}</dd></div></dl></article></div>
    <article className="js-tea-profile__notes"><h2>Personal notes</h2><p>{blend.notes || "No personal notes have been saved."}</p></article>
  </EstatePage>;
}
