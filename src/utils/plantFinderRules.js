export const plantFinderSubjects = ["Leaf", "Flower", "Fruit", "Bark", "Seed pod", "Whole plant", "Tree shape", "Unknown"];

export const plantForms = ["Tree", "Shrub", "Vine", "Herbaceous perennial", "Annual", "Grass or sedge", "Succulent", "Fern", "Aquatic", "Unknown"];
export const leafArrangements = ["Opposite", "Alternate", "Whorled", "Basal", "Compound", "Needle-like", "Scale-like", "Unknown"];
export const leafTraits = ["Smooth edge", "Toothed edge", "Lobed", "Glossy", "Fuzzy", "Waxy", "Variegated", "Aromatic", "Evergreen", "Deciduous", "Narrow", "Broad", "Round", "Heart-shaped", "Lance-shaped"];
export const flowerColors = ["White", "Cream", "Yellow", "Orange", "Pink", "Red", "Purple", "Blue", "Green", "Brown", "No visible flower", "Unknown"];
export const flowerShapes = ["Three petals", "Four petals", "Five petals", "Many petals", "Clustered", "Single", "Tubular", "Daisy-like", "Pea-like", "Bell-shaped", "No visible flower", "Unknown"];
export const fruitTypes = ["Berry", "Drupe", "Pod", "Cone", "Capsule", "Nut", "Pome", "Citrus-like", "No visible fruit", "Unknown"];
export const stemTraits = ["Smooth bark", "Peeling bark", "Thorny", "Square stem", "Hollow stem", "Woody vine", "Upright", "Trailing", "Clumping", "Rosette", "Unknown"];
export const habitatTypes = ["Woodland", "Roadside", "Meadow", "Wetland", "Coastal", "Garden", "Nursery", "Disturbed soil", "Shaded", "Full sun", "Unknown"];
export const identificationStatuses = ["Unconfirmed", "Likely", "Expert Confirmed", "Rejected", "Added to Estate"];

const unknown = "Not established in the local field key.";

// This is a read-only identification key, not a second estate plant collection.
// It contains descriptive comparison traits only; confirmed estate records still live in GardenContext.
export const plantFinderFieldKey = [
  {
    id:"field-red-maple", commonName:"Red Maple", botanicalName:"Acer rubrum", family:"Sapindaceae",
    category:"Other / Uncategorized", type:"Tree", group:"Other / Uncategorized",
    form:["Tree"], leafArrangement:["Opposite"], leafTraits:["Lobed", "Toothed edge", "Broad", "Deciduous"],
    flowerColors:["Red"], flowerShapes:["Clustered"], fruit:["No visible fruit"], stem:["Smooth bark", "Upright"],
    habitat:["Woodland", "Wetland", "Roadside", "Full sun"], regions:["Eastern United States", "North America"], seasons:["Spring", "Autumn"],
    nativeStatus:"Native across much of eastern North America", habit:"Deciduous tree", size:"Medium to large tree", light:"Sun to partial shade", water:"Moist to average soil", zones:"USDA 3–9", flowerSeason:"Late winter to spring", fruitSeason:"Spring samaras", pollinatorValue:"Early pollen resource for insects", invasiveStatus:"Not generally considered invasive in its native range", toxicity:"No general handling warning in this field key", edibility:"Do not treat as edible from an app match", herbalUse:unknown, conservationLegal:"Check local rules before collecting on public land."
  },
  {
    id:"field-white-oak", commonName:"White Oak", botanicalName:"Quercus alba", family:"Fagaceae",
    category:"Other / Uncategorized", type:"Tree", group:"Other / Uncategorized",
    form:["Tree"], leafArrangement:["Alternate"], leafTraits:["Lobed", "Broad", "Deciduous"],
    flowerColors:["Green"], flowerShapes:["Clustered"], fruit:["Nut"], stem:["Upright"],
    habitat:["Woodland", "Meadow", "Full sun"], regions:["Eastern United States", "North America"], seasons:["Spring", "Autumn"],
    nativeStatus:"Native to eastern and central North America", habit:"Broad-canopied deciduous tree", size:"Large tree", light:"Full sun", water:"Average, well-drained soil", zones:"USDA 3–9", flowerSeason:"Spring", fruitSeason:"Autumn acorns", pollinatorValue:"Host plant and wildlife food source", invasiveStatus:"Not invasive in its native range", toxicity:"Acorns and foliage are unsafe for some livestock in quantity", edibility:"Do not eat without expert species confirmation and preparation guidance", herbalUse:unknown, conservationLegal:"Check property and collecting rules before taking specimens."
  },
  {
    id:"field-eastern-redbud", commonName:"Eastern Redbud", botanicalName:"Cercis canadensis", family:"Fabaceae",
    category:"Flowers & Perennials", type:"Tree", group:"Flowers and Perennials",
    form:["Tree", "Shrub"], leafArrangement:["Alternate"], leafTraits:["Smooth edge", "Heart-shaped", "Broad", "Deciduous"],
    flowerColors:["Pink", "Purple"], flowerShapes:["Pea-like", "Clustered"], fruit:["Pod"], stem:["Smooth bark", "Upright"],
    habitat:["Woodland", "Garden", "Roadside", "Shaded"], regions:["Eastern United States", "North America"], seasons:["Spring"],
    nativeStatus:"Native to eastern North America", habit:"Small understory tree", size:"Small tree", light:"Sun to partial shade", water:"Average soil", zones:"USDA 4–9", flowerSeason:"Early spring", fruitSeason:"Summer to autumn pods", pollinatorValue:"Valuable early flowers for bees", invasiveStatus:"Not generally invasive", toxicity:"No general handling warning in this field key", edibility:"Some sources describe edible flowers, but do not consume from an app identification", herbalUse:unknown, conservationLegal:"Observe local collecting rules."
  },
  {
    id:"field-american-hydrangea", commonName:"Smooth Hydrangea", botanicalName:"Hydrangea arborescens", family:"Hydrangeaceae",
    category:"Flowers & Perennials", type:"Shrub", group:"Flowers and Perennials",
    form:["Shrub"], leafArrangement:["Opposite"], leafTraits:["Toothed edge", "Broad", "Deciduous"],
    flowerColors:["White", "Cream", "Green"], flowerShapes:["Clustered"], fruit:["Capsule"], stem:["Upright", "Clumping"],
    habitat:["Woodland", "Garden", "Shaded"], regions:["Eastern United States", "North America"], seasons:["Summer"],
    nativeStatus:"Native to the eastern United States", habit:"Deciduous flowering shrub", size:"Low to medium shrub", light:"Partial shade to filtered sun", water:"Moist, well-drained soil", zones:"USDA 3–9", flowerSeason:"Early to midsummer", fruitSeason:"Dry capsules after flowering", pollinatorValue:"Flowers can support small pollinators", invasiveStatus:"Not generally invasive", toxicity:"Plant parts can be toxic if eaten", edibility:"Not edible", herbalUse:unknown, conservationLegal:"Nursery cultivars may differ from wild plants."
  },
  {
    id:"field-highbush-blueberry", commonName:"Highbush Blueberry", botanicalName:"Vaccinium corymbosum", family:"Ericaceae",
    category:"Berries & Vines", type:"Shrub", group:"Berries and Vines",
    form:["Shrub"], leafArrangement:["Alternate"], leafTraits:["Smooth edge", "Glossy", "Broad", "Deciduous"],
    flowerColors:["White", "Pink"], flowerShapes:["Bell-shaped", "Clustered"], fruit:["Berry"], stem:["Upright", "Clumping"],
    habitat:["Wetland", "Woodland", "Garden", "Full sun"], regions:["Eastern United States", "North America"], seasons:["Spring", "Summer"],
    nativeStatus:"Native to eastern North America", habit:"Multi-stem fruiting shrub", size:"Medium shrub", light:"Full sun to partial shade", water:"Acidic, consistently moist soil", zones:"USDA 3–8", flowerSeason:"Spring", fruitSeason:"Summer", pollinatorValue:"Important spring bee forage", invasiveStatus:"Not invasive in its native range", toxicity:"No general toxicity warning for correctly identified ripe fruit", edibility:"Ripe fruit is commonly edible only after reliable identification", herbalUse:unknown, conservationLegal:"Wild harvest rules vary by land ownership."
  },
  {
    id:"field-common-blackberry", commonName:"Common Blackberry", botanicalName:"Rubus allegheniensis", family:"Rosaceae",
    category:"Berries & Vines", type:"Shrub", group:"Berries and Vines",
    form:["Shrub", "Vine"], leafArrangement:["Alternate", "Compound"], leafTraits:["Toothed edge", "Fuzzy", "Broad", "Deciduous"],
    flowerColors:["White"], flowerShapes:["Five petals", "Clustered"], fruit:["Berry", "Drupe"], stem:["Thorny", "Trailing", "Upright"],
    habitat:["Roadside", "Meadow", "Woodland", "Disturbed soil", "Full sun"], regions:["Eastern United States", "North America"], seasons:["Spring", "Summer"],
    nativeStatus:"Native in much of eastern North America", habit:"Arching thorny canes", size:"Thicket-forming shrub", light:"Sun to partial shade", water:"Average soil", zones:"Broad temperate range", flowerSeason:"Late spring", fruitSeason:"Summer", pollinatorValue:"Flowers support many pollinators", invasiveStatus:"Can spread vigorously", toxicity:"Thorns can injure skin", edibility:"Ripe fruit may be edible after expert identification; dangerous lookalikes and contaminated sites must be excluded", herbalUse:unknown, conservationLegal:"Do not collect beside treated roads or without permission."
  },
  {
    id:"field-poison-ivy", commonName:"Eastern Poison Ivy", botanicalName:"Toxicodendron radicans", family:"Anacardiaceae",
    category:"Other / Uncategorized", type:"Vine", group:"Other / Uncategorized",
    form:["Vine", "Shrub"], leafArrangement:["Alternate", "Compound"], leafTraits:["Smooth edge", "Toothed edge", "Glossy", "Broad", "Deciduous"],
    flowerColors:["Green", "Cream"], flowerShapes:["Clustered"], fruit:["Berry", "Drupe"], stem:["Woody vine", "Trailing"],
    habitat:["Woodland", "Roadside", "Garden", "Disturbed soil", "Shaded", "Full sun"], regions:["Eastern United States", "North America"], seasons:["Spring", "Summer", "Autumn"],
    nativeStatus:"Native to North America", habit:"Climbing or trailing woody vine", size:"Variable vine or low shrub", light:"Shade to full sun", water:"Adaptable", zones:"Broad temperate range", flowerSeason:"Late spring", fruitSeason:"Late summer to winter", pollinatorValue:"Flowers and fruit support wildlife", invasiveStatus:"Native but can be aggressive in managed spaces", toxicity:"Severe contact dermatitis risk from urushiol; avoid touching or burning", edibility:"Never edible", herbalUse:"No home herbal use; exposure can cause serious injury", conservationLegal:"Removal may require protective equipment and local disposal guidance."
  },
  {
    id:"field-peppermint", commonName:"Peppermint", botanicalName:"Mentha × piperita", family:"Lamiaceae",
    category:"Herbs", type:"Mint", group:"Mints",
    form:["Herbaceous perennial"], leafArrangement:["Opposite"], leafTraits:["Toothed edge", "Aromatic", "Broad", "Lance-shaped"],
    flowerColors:["Purple", "Pink"], flowerShapes:["Tubular", "Clustered"], fruit:["No visible fruit"], stem:["Square stem", "Upright", "Clumping"],
    habitat:["Garden", "Wetland", "Disturbed soil", "Full sun"], regions:["Cultivated broadly", "North America", "Europe"], seasons:["Summer"],
    nativeStatus:"Cultivated hybrid; naturalized in many regions", habit:"Spreading rhizomatous herb", size:"Low herbaceous perennial", light:"Sun to partial shade", water:"Moist soil", zones:"USDA 3–9", flowerSeason:"Summer", fruitSeason:unknown, pollinatorValue:"Flowers attract bees and other insects", invasiveStatus:"Can spread aggressively", toxicity:"Concentrated oils and medicinal use require professional guidance", edibility:"Culinary identity must be confirmed before use", herbalUse:"Traditional use is reported, but this finder does not establish safety or dosage", conservationLegal:"Check local invasive-plant guidance before disposal."
  },
  {
    id:"field-lavender", commonName:"English Lavender", botanicalName:"Lavandula angustifolia", family:"Lamiaceae",
    category:"Herbs", type:"Herbaceous perennial", group:"Herbs",
    form:["Herbaceous perennial", "Shrub"], leafArrangement:["Opposite"], leafTraits:["Smooth edge", "Aromatic", "Evergreen", "Narrow", "Fuzzy"],
    flowerColors:["Purple", "Blue", "Pink", "White"], flowerShapes:["Tubular", "Clustered"], fruit:["No visible fruit"], stem:["Square stem", "Upright", "Clumping"],
    habitat:["Garden", "Nursery", "Coastal", "Full sun"], regions:["Cultivated broadly", "Europe", "North America"], seasons:["Summer"],
    nativeStatus:"Native to parts of the Mediterranean; widely cultivated", habit:"Woody-based aromatic perennial", size:"Low mound", light:"Full sun", water:"Dry, sharply drained soil once established", zones:"Usually USDA 5–9, cultivar dependent", flowerSeason:"Summer", fruitSeason:unknown, pollinatorValue:"Highly attractive to bees", invasiveStatus:"Not generally invasive", toxicity:"Essential oils are concentrated and not interchangeable with the plant", edibility:"Use only a confirmed culinary cultivar and qualified guidance", herbalUse:"Traditional aromatic use is common; no medical claim is made", conservationLegal:"Cultivated selections vary."
  },
  {
    id:"field-rosemary", commonName:"Rosemary", botanicalName:"Salvia rosmarinus", family:"Lamiaceae",
    category:"Herbs", type:"Herbaceous perennial", group:"Herbs",
    form:["Shrub", "Herbaceous perennial"], leafArrangement:["Opposite"], leafTraits:["Smooth edge", "Aromatic", "Evergreen", "Narrow", "Needle-like"],
    flowerColors:["Blue", "Purple", "White", "Pink"], flowerShapes:["Tubular", "Clustered"], fruit:["No visible fruit"], stem:["Square stem", "Upright", "Trailing"],
    habitat:["Garden", "Nursery", "Coastal", "Full sun"], regions:["Mediterranean", "Cultivated broadly"], seasons:["Spring", "Summer"],
    nativeStatus:"Mediterranean native; cultivated broadly", habit:"Evergreen aromatic shrub", size:"Small to medium shrub", light:"Full sun", water:"Dry to average, well-drained soil", zones:"Usually USDA 7–10, cultivar dependent", flowerSeason:"Spring through summer", fruitSeason:unknown, pollinatorValue:"Flowers support bees", invasiveStatus:"Not generally invasive in cold climates", toxicity:"Concentrated oil and medicinal doses require professional advice", edibility:"Culinary use requires certain identification and clean growing conditions", herbalUse:"Traditional uses exist; no medical claim or dosage is provided", conservationLegal:unknown
  },
  {
    id:"field-dandelion", commonName:"Common Dandelion", botanicalName:"Taraxacum officinale", family:"Asteraceae",
    category:"Herbs", type:"Herbaceous perennial", group:"Herbs",
    form:["Herbaceous perennial"], leafArrangement:["Basal"], leafTraits:["Lobed", "Toothed edge", "Broad"],
    flowerColors:["Yellow"], flowerShapes:["Daisy-like", "Single", "Many petals"], fruit:["No visible fruit"], stem:["Hollow stem", "Rosette"],
    habitat:["Meadow", "Roadside", "Garden", "Disturbed soil", "Full sun"], regions:["Europe", "North America", "Cultivated broadly"], seasons:["Spring", "Summer", "Autumn"],
    nativeStatus:"Introduced in much of North America", habit:"Tap-rooted rosette perennial", size:"Low herb", light:"Sun", water:"Adaptable", zones:"Broad temperate range", flowerSeason:"Most of the growing season", fruitSeason:"Wind-borne seed heads follow flowers", pollinatorValue:"Can provide early-season forage", invasiveStatus:"Commonly weedy", toxicity:"Lookalikes and herbicide exposure must be excluded", edibility:"Do not eat based only on an app match", herbalUse:"Traditional uses are reported; this tool gives no medical advice", conservationLegal:"Avoid collecting from sprayed lawns, roadsides, or restricted land."
  },
  {
    id:"field-wild-carrot", commonName:"Wild Carrot / Queen Anne’s Lace", botanicalName:"Daucus carota", family:"Apiaceae",
    category:"Other / Uncategorized", type:"Herbaceous perennial", group:"Other / Uncategorized",
    form:["Herbaceous perennial"], leafArrangement:["Alternate", "Basal", "Compound"], leafTraits:["Toothed edge", "Narrow", "Aromatic"],
    flowerColors:["White"], flowerShapes:["Clustered"], fruit:["No visible fruit"], stem:["Upright", "Hollow stem"],
    habitat:["Roadside", "Meadow", "Disturbed soil", "Full sun"], regions:["Europe", "North America"], seasons:["Summer"],
    nativeStatus:"Introduced and naturalized in North America", habit:"Upright biennial herb", size:"Medium herbaceous plant", light:"Full sun", water:"Average to dry soil", zones:"Broad temperate range", flowerSeason:"Summer", fruitSeason:"Dry bristled seed structures", pollinatorValue:"Umbels attract many small insects", invasiveStatus:"Can be weedy or regulated regionally", toxicity:"Dangerous confusion with poison hemlock and other toxic Apiaceae is possible", edibility:"Never consume from an app identification", herbalUse:"No home use recommended because of dangerous lookalikes", conservationLegal:"Check local noxious-weed status."
  },
  {
    id:"field-poison-hemlock", commonName:"Poison Hemlock", botanicalName:"Conium maculatum", family:"Apiaceae",
    category:"Other / Uncategorized", type:"Herbaceous perennial", group:"Other / Uncategorized",
    form:["Herbaceous perennial"], leafArrangement:["Alternate", "Compound"], leafTraits:["Toothed edge", "Narrow", "Broad"],
    flowerColors:["White"], flowerShapes:["Clustered"], fruit:["No visible fruit"], stem:["Hollow stem", "Upright"],
    habitat:["Roadside", "Wetland", "Disturbed soil", "Meadow", "Full sun"], regions:["Europe", "North America"], seasons:["Spring", "Summer"],
    nativeStatus:"Introduced and invasive in much of North America", habit:"Tall upright biennial", size:"Tall herbaceous plant", light:"Sun to partial shade", water:"Moist to average soil", zones:"Broad temperate range", flowerSeason:"Late spring to summer", fruitSeason:"Dry ribbed fruits", pollinatorValue:"Insects may visit flowers, but handling is unsafe", invasiveStatus:"Invasive or noxious in many jurisdictions", toxicity:"Extremely poisonous to people and animals; avoid ingestion and use protective handling guidance", edibility:"Never edible", herbalUse:"No home medicinal use; potentially fatal", conservationLegal:"Report or manage according to local noxious-weed guidance."
  },
  {
    id:"field-rose", commonName:"Garden Rose", botanicalName:"Rosa species or hybrid", family:"Rosaceae",
    category:"Flowers & Perennials", type:"Rose", group:"Flowers and Perennials",
    form:["Shrub", "Vine"], leafArrangement:["Alternate", "Compound"], leafTraits:["Toothed edge", "Glossy", "Deciduous"],
    flowerColors:["White", "Cream", "Yellow", "Orange", "Pink", "Red", "Purple"], flowerShapes:["Five petals", "Many petals", "Single", "Clustered"], fruit:["Berry"], stem:["Thorny", "Upright", "Trailing"],
    habitat:["Garden", "Nursery", "Full sun"], regions:["Cultivated broadly"], seasons:["Spring", "Summer", "Autumn"],
    nativeStatus:"Species and hybrid origin varies", habit:"Woody shrub or climber", size:"Highly variable", light:"Usually full sun", water:"Average, well-drained soil", zones:"Cultivar dependent", flowerSeason:"Spring through autumn, cultivar dependent", fruitSeason:"Rose hips may form after flowering", pollinatorValue:"Single-flowered forms can support pollinators", invasiveStatus:"Some wild rose species spread aggressively", toxicity:"Thorns can injure; pesticide residues matter", edibility:"Do not consume flowers or hips without exact identity and clean-growing confirmation", herbalUse:"Traditional uses exist; no medical advice is provided", conservationLegal:"Some native rose species may be locally protected."
  },
  {
    id:"field-common-fig", commonName:"Common Fig", botanicalName:"Ficus carica", family:"Moraceae",
    category:"Fruit Trees", type:"Fruit Tree", group:"Figs",
    form:["Tree", "Shrub"], leafArrangement:["Alternate"], leafTraits:["Lobed", "Broad", "Fuzzy", "Deciduous"],
    flowerColors:["No visible flower"], flowerShapes:["No visible flower"], fruit:["Pome"], stem:["Smooth bark", "Upright"],
    habitat:["Garden", "Nursery", "Full sun"], regions:["Mediterranean", "Cultivated broadly"], seasons:["Summer", "Autumn"],
    nativeStatus:"Mediterranean and western Asian origin; cultivated broadly", habit:"Small fruit tree or large shrub", size:"Small to medium tree", light:"Full sun", water:"Average, well-drained soil", zones:"Usually USDA 7–10; hardy cultivars vary", flowerSeason:"Flowers are enclosed inside the fig structure", fruitSeason:"Summer to autumn", pollinatorValue:"Pollination biology varies by fig type", invasiveStatus:"Can naturalize in warm regions", toxicity:"Milky sap can irritate skin; fruit is unsafe for some animals", edibility:"Only correctly identified, ripe cultivated fruit should be considered food", herbalUse:unknown, conservationLegal:"Cultivation restrictions may apply in some ecosystems."
  },
  {
    id:"field-lemon", commonName:"Lemon", botanicalName:"Citrus × limon", family:"Rutaceae",
    category:"Citrus", type:"Fruit Tree", group:"Citrus",
    form:["Tree", "Shrub"], leafArrangement:["Alternate"], leafTraits:["Smooth edge", "Glossy", "Aromatic", "Evergreen", "Broad"],
    flowerColors:["White", "Pink"], flowerShapes:["Five petals", "Clustered", "Single"], fruit:["Citrus-like"], stem:["Thorny", "Upright"],
    habitat:["Garden", "Nursery", "Full sun"], regions:["Cultivated broadly", "Subtropical regions"], seasons:["Spring", "Summer", "Autumn", "Winter"],
    nativeStatus:"Cultivated hybrid", habit:"Evergreen citrus tree", size:"Small tree", light:"Full sun", water:"Regular water with drainage", zones:"Usually USDA 9–11; containers elsewhere", flowerSeason:"Often recurrent", fruitSeason:"Cultivar and climate dependent", pollinatorValue:"Fragrant flowers attract pollinators", invasiveStatus:"Not generally invasive", toxicity:"Oils and plant parts may irritate; citrus can be unsafe for some pets", edibility:"Do not consume unknown fruit from an app match", herbalUse:unknown, conservationLegal:"Citrus movement may be restricted in disease quarantine areas."
  }
];

export const fieldKeyById = new Map(plantFinderFieldKey.map((plant) => [plant.id, plant]));

