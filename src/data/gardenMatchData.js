const tierForIndex = (index) => index < 6 ? "sprout" : index < 10 ? "bloom" : "master-gardener";

const createCategoryCards = (category, pairStyle, pairs) => pairs.flatMap((pair, index) => {
  const pairId = `${category}-${pair.id}`;
  const difficultyTier = tierForIndex(index);

  return [pair.first, pair.second].map((face, faceIndex) => ({
    id: `${pairId}-${faceIndex === 0 ? "a" : "b"}`,
    category,
    pairId,
    title: face.title,
    image: face.image || null,
    emoji: face.emoji || "🌿",
    description: face.description || "",
    cardType: face.cardType || (faceIndex === 0 ? "botanical" : "match"),
    pairStyle: pair.pairStyle || pairStyle,
    difficultyTier,
  }));
});

export const gardenMatchCategories = [
  { id:"orchard", label:"Orchard", emoji:"🍎", description:"Pair orchard trees with their fruit, blossoms, and harvest clues." },
  { id:"herbs", label:"Herbs", emoji:"🌿", description:"Match fragrant herbs with their scents, kitchen uses, and tea traditions." },
  { id:"vegetables", label:"Vegetables", emoji:"🥕", description:"Connect garden plants with the vegetables they bring to the table." },
  { id:"flowers", label:"Flowers", emoji:"🌹", description:"Pair estate flowers with their blooms, features, and favorite visitors." },
  { id:"garden-pests", label:"Garden Pests", emoji:"🐞", description:"Match common garden visitors with gentle, practical responses." },
  { id:"garden-vocabulary", label:"Garden Vocabulary", emoji:"📖", description:"Connect useful botanical terms with their plain-language meanings." },
];

export const gardenMatchDifficulties = [
  { id:"sprout", label:"Sprout", pairCount:6, description:"A welcoming 6-pair garden stroll." },
  { id:"bloom", label:"Bloom", pairCount:10, description:"A lively 10-pair botanical challenge." },
  { id:"master-gardener", label:"Master Gardener", pairCount:15, description:"The complete 15-pair estate collection." },
];

const orchardCards = createCategoryCards("orchard", "plant-to-harvest", [
  { id:"apple", first:{ title:"Apple Tree", emoji:"🌳", description:"Spring blossom and spreading orchard branches", cardType:"plant" }, second:{ title:"Apple", emoji:"🍎", description:"Its crisp autumn harvest", cardType:"harvest" } },
  { id:"pear", first:{ title:"Pear Tree", emoji:"🌿", description:"An upright tree with snowy blossoms", cardType:"plant" }, second:{ title:"Pear", emoji:"🍐", description:"Its sweet bell-shaped fruit", cardType:"harvest" } },
  { id:"peach", first:{ title:"Peach Tree", emoji:"🌸", description:"A rosy-flowered stone-fruit tree", cardType:"plant" }, second:{ title:"Peach", emoji:"🍑", description:"Its soft, fragrant summer fruit", cardType:"harvest" } },
  { id:"plum", first:{ title:"Plum Tree", emoji:"🌳", description:"A compact tree with delicate white bloom", cardType:"plant" }, second:{ title:"Plum", emoji:"🟣", description:"Its jewel-toned stone fruit", cardType:"harvest" } },
  { id:"cherry", first:{ title:"Cherry Tree", emoji:"🌸", description:"A spring cloud of pale blossoms", cardType:"plant" }, second:{ title:"Cherries", emoji:"🍒", description:"Its bright paired harvest", cardType:"harvest" } },
  { id:"fig", first:{ title:"Fig Tree", emoji:"🌿", description:"Broad leaves and warm-weather growth", cardType:"plant" }, second:{ title:"Fig", emoji:"🫐", description:"Its honeyed, soft-centered fruit", cardType:"harvest" } },
  { id:"lemon", first:{ title:"Lemon Tree", emoji:"🌳", description:"Glossy evergreen citrus foliage", cardType:"plant" }, second:{ title:"Lemons", emoji:"🍋", description:"Its bright, tart harvest", cardType:"harvest" } },
  { id:"mandarin", first:{ title:"Mandarin Tree", emoji:"🌿", description:"A compact citrus with fragrant bloom", cardType:"plant" }, second:{ title:"Mandarins", emoji:"🍊", description:"Its easy-peeling sweet fruit", cardType:"harvest" } },
  { id:"nectarine", first:{ title:"Nectarine Tree", emoji:"🌸", description:"A peach relative with smooth fruit", cardType:"plant" }, second:{ title:"Nectarine", emoji:"🍑", description:"Its glossy summer harvest", cardType:"harvest" } },
  { id:"apricot", first:{ title:"Apricot Tree", emoji:"🌳", description:"An early-blooming stone-fruit tree", cardType:"plant" }, second:{ title:"Apricot", emoji:"🟠", description:"Its small golden harvest", cardType:"harvest" } },
  { id:"scion", pairStyle:"term-to-clue", first:{ title:"Scion", emoji:"✂️", description:"The chosen fruiting twig in a graft", cardType:"orchard-term" }, second:{ title:"Upper Graft Piece", emoji:"🌱", description:"Joined to a compatible rootstock", cardType:"meaning" } },
  { id:"rootstock", pairStyle:"term-to-clue", first:{ title:"Rootstock", emoji:"🪴", description:"The rooted base of a grafted tree", cardType:"orchard-term" }, second:{ title:"Roots & Vigor", emoji:"🌿", description:"Controls size, strength, and adaptation", cardType:"meaning" } },
  { id:"espalier", pairStyle:"term-to-clue", first:{ title:"Espalier", emoji:"🏡", description:"A formal orchard training method", cardType:"orchard-term" }, second:{ title:"Branches on a Wall", emoji:"↔️", description:"Limbs are trained in a flat pattern", cardType:"meaning" } },
  { id:"thinning", pairStyle:"care-to-purpose", first:{ title:"Fruit Thinning", emoji:"✋", description:"Removing some young fruit", cardType:"care" }, second:{ title:"Larger, Healthier Harvest", emoji:"🧺", description:"The remaining fruit gets more resources", cardType:"purpose" } },
  { id:"dormant-pruning", pairStyle:"care-to-season", first:{ title:"Dormant Pruning", emoji:"✂️", description:"Structural pruning while growth rests", cardType:"care" }, second:{ title:"Late Winter", emoji:"❄️", description:"A common time for orchard shaping", cardType:"season" } },
]);

const herbCards = createCategoryCards("herbs", "herb-to-use", [
  { id:"peppermint", first:{ title:"Peppermint", emoji:"🌿", description:"A brisk, cooling mint", cardType:"herb" }, second:{ title:"Cooling Tea", emoji:"🍵", description:"A bright after-meal infusion", cardType:"use" } },
  { id:"basil", first:{ title:"Basil", emoji:"🌱", description:"Tender, fragrant summer leaves", cardType:"herb" }, second:{ title:"Pesto", emoji:"🥣", description:"A classic fresh-leaf kitchen use", cardType:"use" } },
  { id:"rosemary", first:{ title:"Rosemary", emoji:"🌿", description:"Pine-scented evergreen needles", cardType:"herb" }, second:{ title:"Roasted Vegetables", emoji:"🥔", description:"Its savory kitchen companion", cardType:"use" } },
  { id:"lavender", first:{ title:"Lavender", emoji:"🪻", description:"Purple flower spikes with a soft perfume", cardType:"herb" }, second:{ title:"Calming Sachet", emoji:"💜", description:"A fragrant linen-cupboard tradition", cardType:"use" } },
  { id:"chamomile", first:{ title:"Chamomile", emoji:"🌼", description:"Tiny daisy-like flowers", cardType:"herb" }, second:{ title:"Bedtime Infusion", emoji:"☕", description:"A gentle floral cup", cardType:"use" } },
  { id:"thyme", first:{ title:"Thyme", emoji:"🌿", description:"Small leaves on woody stems", cardType:"herb" }, second:{ title:"Savory Bouquet", emoji:"🍲", description:"Adds earthy flavor to soups and roasts", cardType:"use" } },
  { id:"sage", first:{ title:"Sage", emoji:"🍃", description:"Soft silver-green aromatic leaves", cardType:"herb" }, second:{ title:"Autumn Stuffing", emoji:"🍞", description:"A warm, savory seasonal use", cardType:"use" } },
  { id:"lemon-balm", first:{ title:"Lemon Balm", emoji:"🌱", description:"A citrus-scented member of the mint family", cardType:"herb" }, second:{ title:"Lemony Iced Tea", emoji:"🫖", description:"A bright garden refreshment", cardType:"use" } },
  { id:"dill", first:{ title:"Dill", emoji:"🌿", description:"Fine feathery leaves and seed umbels", cardType:"herb" }, second:{ title:"Pickling Herb", emoji:"🥒", description:"A familiar companion for cucumbers", cardType:"use" } },
  { id:"parsley", first:{ title:"Parsley", emoji:"☘️", description:"Fresh green leaves with clean flavor", cardType:"herb" }, second:{ title:"Finishing Garnish", emoji:"🍽️", description:"Scattered fresh over savory dishes", cardType:"use" } },
  { id:"tarragon", first:{ title:"Tarragon", emoji:"🌿", description:"Slender leaves with an anise note", cardType:"herb" }, second:{ title:"French Herb Sauce", emoji:"🥄", description:"A classic béarnaise flavor", cardType:"use" } },
  { id:"fennel", first:{ title:"Fennel Frond", emoji:"🌱", description:"Feathery foliage with sweet anise scent", cardType:"herb" }, second:{ title:"Licorice Aroma", emoji:"✨", description:"Its unmistakable fragrance clue", cardType:"scent" } },
  { id:"bergamot", first:{ title:"Bee Balm", emoji:"🌺", description:"A pollinator herb with tufted flowers", cardType:"herb" }, second:{ title:"Bergamot-Like Tea", emoji:"🫖", description:"A fragrant leaf-and-flower infusion", cardType:"use" } },
  { id:"stevia", first:{ title:"Stevia", emoji:"🌿", description:"A tender herb with very sweet leaves", cardType:"herb" }, second:{ title:"Natural Sweetener", emoji:"🍯", description:"A little leaf brings plenty of sweetness", cardType:"use" } },
  { id:"calendula", first:{ title:"Calendula", emoji:"🌼", description:"Golden edible petals for the herb garden", cardType:"herb" }, second:{ title:"Petal-Infused Oil", emoji:"🫙", description:"A traditional topical preparation", cardType:"use" } },
]);

const vegetableCards = createCategoryCards("vegetables", "plant-to-harvest", [
  { id:"tomato", first:{ title:"Tomato Vine", emoji:"🌿", description:"A sun-loving vine with yellow flowers", cardType:"plant" }, second:{ title:"Tomato", emoji:"🍅", description:"Its juicy summer harvest", cardType:"harvest" } },
  { id:"cucumber", first:{ title:"Cucumber Vine", emoji:"🌱", description:"Climbing tendrils and broad leaves", cardType:"plant" }, second:{ title:"Cucumber", emoji:"🥒", description:"Its crisp green harvest", cardType:"harvest" } },
  { id:"pepper", first:{ title:"Pepper Plant", emoji:"🌿", description:"A branching warm-season plant", cardType:"plant" }, second:{ title:"Pepper", emoji:"🫑", description:"Its colorful hollow fruit", cardType:"harvest" } },
  { id:"carrot", first:{ title:"Carrot Tops", emoji:"🌱", description:"Fine ferny leaves above the soil", cardType:"plant" }, second:{ title:"Carrot", emoji:"🥕", description:"The sweet root hidden below", cardType:"harvest" } },
  { id:"eggplant", first:{ title:"Eggplant", emoji:"🌿", description:"Velvety leaves and violet flowers", cardType:"plant" }, second:{ title:"Aubergine", emoji:"🍆", description:"Its glossy purple harvest", cardType:"harvest" } },
  { id:"pumpkin", first:{ title:"Pumpkin Vine", emoji:"🍃", description:"Long rambling stems and golden blooms", cardType:"plant" }, second:{ title:"Pumpkin", emoji:"🎃", description:"Its round autumn harvest", cardType:"harvest" } },
  { id:"peas", first:{ title:"Pea Vine", emoji:"🌱", description:"Curling tendrils climb a trellis", cardType:"plant" }, second:{ title:"Pea Pods", emoji:"🫛", description:"Its sweet spring harvest", cardType:"harvest" } },
  { id:"lettuce", first:{ title:"Lettuce Rosette", emoji:"🌿", description:"Tender leaves arranged in a low crown", cardType:"plant" }, second:{ title:"Salad Greens", emoji:"🥬", description:"Its cool-season harvest", cardType:"harvest" } },
  { id:"broccoli", first:{ title:"Broccoli Plant", emoji:"🌱", description:"Blue-green leaves around a central head", cardType:"plant" }, second:{ title:"Broccoli Crown", emoji:"🥦", description:"Its unopened flower-bud harvest", cardType:"harvest" } },
  { id:"corn", first:{ title:"Corn Stalk", emoji:"🌾", description:"A tall grass with tassels and silks", cardType:"plant" }, second:{ title:"Sweet Corn", emoji:"🌽", description:"Its golden summer ears", cardType:"harvest" } },
  { id:"potato", first:{ title:"Potato Foliage", emoji:"🌿", description:"Leafy stems grow above the mound", cardType:"plant" }, second:{ title:"Potatoes", emoji:"🥔", description:"Tubers gathered from beneath the soil", cardType:"harvest" } },
  { id:"onion", first:{ title:"Onion Tops", emoji:"🌱", description:"Hollow green leaves rise from the bulb", cardType:"plant" }, second:{ title:"Onion Bulb", emoji:"🧅", description:"Its layered underground harvest", cardType:"harvest" } },
  { id:"asparagus", first:{ title:"Asparagus Crown", emoji:"🌿", description:"A perennial vegetable bed", cardType:"plant" }, second:{ title:"Tender Spears", emoji:"🎋", description:"Young shoots harvested in spring", cardType:"harvest" } },
  { id:"artichoke", first:{ title:"Artichoke Plant", emoji:"🌿", description:"Large silver leaves in a dramatic rosette", cardType:"plant" }, second:{ title:"Flower Bud", emoji:"💚", description:"Harvested before its purple bloom opens", cardType:"harvest" } },
  { id:"zucchini", first:{ title:"Zucchini Plant", emoji:"🍃", description:"A broad-leaved summer squash", cardType:"plant" }, second:{ title:"Courgette", emoji:"🥒", description:"Its slender green harvest", cardType:"harvest" } },
]);

const flowerCards = createCategoryCards("flowers", "flower-to-feature", [
  { id:"rose", first:{ title:"Rose", emoji:"🌹", description:"Layered petals on a thorny stem", cardType:"flower" }, second:{ title:"Classic Fragrance", emoji:"💗", description:"Its treasured estate perfume", cardType:"feature" } },
  { id:"sunflower", first:{ title:"Sunflower", emoji:"🌻", description:"A tall golden summer bloom", cardType:"flower" }, second:{ title:"Seed-Filled Center", emoji:"🌰", description:"A feast for late-season birds", cardType:"feature" } },
  { id:"tulip", first:{ title:"Tulip", emoji:"🌷", description:"A smooth cup-shaped spring flower", cardType:"flower" }, second:{ title:"Spring Bulb", emoji:"🧅", description:"Planted beneath the soil in autumn", cardType:"feature" } },
  { id:"hydrangea", first:{ title:"Hydrangea", emoji:"🪻", description:"A shrub with generous clustered blooms", cardType:"flower" }, second:{ title:"Mophead Cluster", emoji:"💠", description:"Its globe of many small florets", cardType:"feature" } },
  { id:"daisy", first:{ title:"Daisy", emoji:"🌼", description:"White rays around a sunny center", cardType:"flower" }, second:{ title:"Open Disc Bloom", emoji:"☀️", description:"A landing place for small pollinators", cardType:"feature" } },
  { id:"iris", first:{ title:"Iris", emoji:"💜", description:"A stately bloom with falls and standards", cardType:"flower" }, second:{ title:"Sword-Shaped Leaves", emoji:"🌿", description:"Its distinctive upright foliage", cardType:"feature" } },
  { id:"peony", first:{ title:"Peony", emoji:"🌸", description:"A lush late-spring perennial", cardType:"flower" }, second:{ title:"Ruffled Bowl Bloom", emoji:"🎀", description:"Layers of soft, fragrant petals", cardType:"feature" } },
  { id:"camellia", first:{ title:"Camellia", emoji:"🌺", description:"An evergreen shrub with polished leaves", cardType:"flower" }, second:{ title:"Winter Rose", emoji:"❄️", description:"Roselike blooms in the cool season", cardType:"feature" } },
  { id:"foxglove", first:{ title:"Foxglove", emoji:"🪻", description:"A cottage-garden tower of bells", cardType:"flower" }, second:{ title:"Bumblebee Bells", emoji:"🐝", description:"Spotted tubes invite sturdy pollinators", cardType:"feature" } },
  { id:"cosmos", first:{ title:"Cosmos", emoji:"🌸", description:"Airy stems with silken daisy blooms", cardType:"flower" }, second:{ title:"Feathery Foliage", emoji:"🌿", description:"Its delicate threadlike leaves", cardType:"feature" } },
  { id:"delphinium", first:{ title:"Delphinium", emoji:"💙", description:"A blue tower in the formal border", cardType:"flower" }, second:{ title:"Tall Flower Spire", emoji:"⬆️", description:"Many blossoms climb one upright stem", cardType:"feature" } },
  { id:"nasturtium", first:{ title:"Nasturtium", emoji:"🧡", description:"A bright edible garden flower", cardType:"flower" }, second:{ title:"Peppery Petals", emoji:"🥗", description:"Colorful blooms for a summer salad", cardType:"feature" } },
  { id:"sweet-pea", first:{ title:"Sweet Pea", emoji:"🌸", description:"A fragrant climbing annual", cardType:"flower" }, second:{ title:"Tendril Climber", emoji:"〰️", description:"It reaches upward on curling supports", cardType:"feature" } },
  { id:"zinnia", first:{ title:"Zinnia", emoji:"🌺", description:"A cheerful heat-loving annual", cardType:"flower" }, second:{ title:"Butterfly Favorite", emoji:"🦋", description:"Broad blooms offer easy nectar landings", cardType:"feature" } },
  { id:"hellebore", first:{ title:"Hellebore", emoji:"🌸", description:"A shade-loving perennial with nodding bloom", cardType:"flower" }, second:{ title:"Lenten Rose", emoji:"⛅", description:"Its familiar late-winter garden name", cardType:"feature" } },
]);

const pestCards = createCategoryCards("garden-pests", "pest-to-treatment", [
  { id:"aphids", first:{ title:"Aphids", emoji:"🪲", description:"Clusters of tiny sap-sucking insects", cardType:"pest" }, second:{ title:"Firm Water Spray", emoji:"💧", description:"Knock them from tender stems", cardType:"treatment" } },
  { id:"slugs", first:{ title:"Slugs", emoji:"🐌", description:"Silvery trails and ragged leaf holes", cardType:"pest" }, second:{ title:"Copper Barrier", emoji:"⭕", description:"Protect vulnerable beds and pots", cardType:"treatment" } },
  { id:"cabbage-worm", first:{ title:"Cabbage Worm", emoji:"🐛", description:"Green caterpillars on brassica leaves", cardType:"pest" }, second:{ title:"Inspect Leaf Undersides", emoji:"🔎", description:"Hand-pick eggs and young caterpillars", cardType:"treatment" } },
  { id:"spider-mites", first:{ title:"Spider Mites", emoji:"🕷️", description:"Fine webbing and stippled leaves", cardType:"pest" }, second:{ title:"Rinse & Raise Humidity", emoji:"🚿", description:"A gentle first response for affected plants", cardType:"treatment" } },
  { id:"japanese-beetles", first:{ title:"Japanese Beetles", emoji:"🪲", description:"Metallic beetles skeletonize foliage", cardType:"pest" }, second:{ title:"Morning Hand-Pick", emoji:"🪣", description:"Drop adults into soapy water", cardType:"treatment" } },
  { id:"whiteflies", first:{ title:"Whiteflies", emoji:"🦟", description:"Tiny white insects flutter from leaves", cardType:"pest" }, second:{ title:"Yellow Sticky Card", emoji:"🟨", description:"Monitor adults near affected plants", cardType:"treatment" } },
  { id:"fungus-gnats", first:{ title:"Fungus Gnats", emoji:"🦟", description:"Small flies around damp potting soil", cardType:"pest" }, second:{ title:"Let Surface Dry", emoji:"☀️", description:"Interrupt larvae in overly wet soil", cardType:"treatment" } },
  { id:"squash-bugs", first:{ title:"Squash Bugs", emoji:"🪲", description:"Brown insects and bronze egg clusters", cardType:"pest" }, second:{ title:"Remove Egg Clusters", emoji:"🧤", description:"Check squash leaves early and often", cardType:"treatment" } },
  { id:"hornworm", first:{ title:"Tomato Hornworm", emoji:"🐛", description:"Large green caterpillar with a tail horn", cardType:"pest" }, second:{ title:"Hand-Pick at Dusk", emoji:"🌆", description:"Search chewed tomato stems carefully", cardType:"treatment" } },
  { id:"thrips", first:{ title:"Thrips", emoji:"〰️", description:"Tiny slender insects scar petals and leaves", cardType:"pest" }, second:{ title:"Blue Sticky Card", emoji:"🟦", description:"Monitor adults among flowers", cardType:"treatment" } },
  { id:"leaf-miner", first:{ title:"Leaf Miner", emoji:"🐛", description:"Winding pale tunnels inside leaves", cardType:"pest" }, second:{ title:"Remove Mined Leaves", emoji:"✂️", description:"Dispose of the affected foliage", cardType:"treatment" } },
  { id:"scale", first:{ title:"Scale Insects", emoji:"🟤", description:"Still, shell-like bumps on stems", cardType:"pest" }, second:{ title:"Soft Brush Check", emoji:"🪥", description:"Gently remove and monitor small colonies", cardType:"treatment" } },
  { id:"cutworm", first:{ title:"Cutworm", emoji:"🐛", description:"Seedlings severed at soil level", cardType:"pest" }, second:{ title:"Seedling Collar", emoji:"🛡️", description:"A simple barrier around young stems", cardType:"treatment" } },
  { id:"earwig", first:{ title:"Earwig", emoji:"🪲", description:"Night feeder hiding in cool crevices", cardType:"pest" }, second:{ title:"Rolled Paper Trap", emoji:"📰", description:"Offer a daytime hiding place to collect", cardType:"treatment" } },
  { id:"mealybug", first:{ title:"Mealybug", emoji:"☁️", description:"Cottony clusters at leaf joints", cardType:"pest" }, second:{ title:"Isolate & Inspect", emoji:"🔍", description:"Keep the plant apart while treating spots", cardType:"treatment" } },
]);

const vocabularyCards = createCategoryCards("garden-vocabulary", "term-to-definition", [
  { id:"annual", first:{ title:"Annual", emoji:"🌱", description:"A plant-life-cycle term", cardType:"term" }, second:{ title:"One-Season Life Cycle", emoji:"1️⃣", description:"Grows, flowers, seeds, and finishes in one season", cardType:"definition" } },
  { id:"perennial", first:{ title:"Perennial", emoji:"🌿", description:"A plant-life-cycle term", cardType:"term" }, second:{ title:"Returns for Years", emoji:"🔄", description:"Lives through more than two growing seasons", cardType:"definition" } },
  { id:"germination", first:{ title:"Germination", emoji:"🌰", description:"The beginning of seed growth", cardType:"term" }, second:{ title:"A Seed Awakens", emoji:"🌱", description:"Root and shoot begin to emerge", cardType:"definition" } },
  { id:"pollination", first:{ title:"Pollination", emoji:"🐝", description:"A flower-reproduction process", cardType:"term" }, second:{ title:"Pollen Reaches a Flower", emoji:"🌼", description:"The step that can lead to seed and fruit", cardType:"definition" } },
  { id:"compost", first:{ title:"Compost", emoji:"🍂", description:"A soil-building garden material", cardType:"term" }, second:{ title:"Decomposed Organic Matter", emoji:"♻️", description:"Finished scraps and leaves that enrich soil", cardType:"definition" } },
  { id:"mulch", first:{ title:"Mulch", emoji:"🪵", description:"A protective garden layer", cardType:"term" }, second:{ title:"Covers Bare Soil", emoji:"🛏️", description:"Conserves moisture and moderates temperature", cardType:"definition" } },
  { id:"deadhead", first:{ title:"Deadhead", emoji:"✂️", description:"A flower-care verb", cardType:"term" }, second:{ title:"Remove Spent Blooms", emoji:"🌸", description:"Encourages tidiness and sometimes more flowers", cardType:"definition" } },
  { id:"hardening-off", first:{ title:"Hardening Off", emoji:"🪴", description:"A seedling transition", cardType:"term" }, second:{ title:"Gradual Outdoor Acclimation", emoji:"☀️", description:"Young plants slowly adjust before transplanting", cardType:"definition" } },
  { id:"photosynthesis", first:{ title:"Photosynthesis", emoji:"🍃", description:"How green plants capture energy", cardType:"term" }, second:{ title:"Light Becomes Plant Food", emoji:"☀️", description:"Leaves use light, water, and carbon dioxide", cardType:"definition" } },
  { id:"transplant", first:{ title:"Transplant", emoji:"🪴", description:"A garden move", cardType:"term" }, second:{ title:"Move to a New Growing Place", emoji:"➡️", description:"Rehome a plant with roots and soil protected", cardType:"definition" } },
  { id:"cultivar", first:{ title:"Cultivar", emoji:"🏷️", description:"A named plant selection", cardType:"term" }, second:{ title:"Cultivated Variety", emoji:"🌹", description:"Chosen and maintained for particular traits", cardType:"definition" } },
  { id:"chlorosis", first:{ title:"Chlorosis", emoji:"🍂", description:"A plant-health observation", cardType:"term" }, second:{ title:"Leaf Yellowing", emoji:"💛", description:"Loss or lack of healthy green color", cardType:"definition" } },
  { id:"node", first:{ title:"Node", emoji:"🌿", description:"A point on a plant stem", cardType:"term" }, second:{ title:"Leaf or Bud Junction", emoji:"🔘", description:"New growth can emerge from this stem point", cardType:"definition" } },
  { id:"bolting", first:{ title:"Bolting", emoji:"⬆️", description:"A rapid shift in leafy crops", cardType:"term" }, second:{ title:"Premature Flower Stalk", emoji:"🌼", description:"Heat or stress prompts seed production", cardType:"definition" } },
  { id:"stratification", first:{ title:"Stratification", emoji:"❄️", description:"A seed-preparation method", cardType:"term" }, second:{ title:"Moist Cold Treatment", emoji:"🌰", description:"Imitates winter to help certain seeds sprout", cardType:"definition" } },
]);

export const gardenMatchCards = [
  ...orchardCards,
  ...herbCards,
  ...vegetableCards,
  ...flowerCards,
  ...pestCards,
  ...vocabularyCards,
];

export const gardenMatchCardTypeLabels = {
  plant:"Plant",
  harvest:"Harvest",
  botanical:"Botanical",
  match:"Match",
  herb:"Herb",
  use:"Use",
  scent:"Scent",
  flower:"Flower",
  feature:"Garden clue",
  pest:"Garden visitor",
  treatment:"Garden response",
  term:"Garden term",
  definition:"Meaning",
  "orchard-term":"Orchard term",
  meaning:"Meaning",
  care:"Care practice",
  purpose:"Why it helps",
  season:"Season",
};
