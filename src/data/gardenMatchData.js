const tierForIndex = (index) => index < 6 ? "sprout" : index < 8 ? "bloom" : index < 10 ? "estate" : "master-gardener";

const createCategoryCards = (category, pairStyle, pairs) => pairs.flatMap((pair, index) => {
  const pairId = `${category}-${pair.id}`;
  const difficultyTier = tierForIndex(index);
  const pairName = pair.name || pair.first.title;
  const pairIcon = pair.icon || pair.first.emoji || "🌿";
  const shortFact = pair.shortFact || pair.first.description || pair.second.description || "";
  const rarity = pair.rarity || (index > 9 ? "heirloom" : index > 5 ? "uncommon" : "common");

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
    name: pairName,
    icon: pairIcon,
    shortFact,
    rarity,
    collectionId: category,
    season: pair.season || "all",
  }));
});

export const gardenMatchModes = [
  { id:"classic", label:"Classic", icon:"♟", description:"Unhurried memory matching with moves and time recorded.", badge:"Estate Favorite" },
  { id:"timed", label:"Timed", icon:"⌛", description:"Gather every pair before the estate sundial expires.", badge:"Sundial Trial" },
  { id:"limited-moves", label:"Limited Moves", icon:"✦", description:"Finish the garden within a carefully measured move allowance.", badge:"Precision Play" },
  { id:"daily-garden", label:"Daily Garden", icon:"☀", description:"One date-seeded challenge shared by every play today.", badge:"Daily Bloom" },
];

export const gardenMatchDifficulties = [
  { id:"sprout", label:"Sprout", pairCount:6, description:"A welcoming 6-pair garden stroll with a short preview.", previewMs:2600, hintLimit:3, timeLimitSeconds:90, moveLimit:14, multiplier:1 },
  { id:"bloom", label:"Bloom", pairCount:8, description:"An 8-pair botanical challenge with lighter assistance.", previewMs:1500, hintLimit:2, timeLimitSeconds:105, moveLimit:18, multiplier:1.25 },
  { id:"estate", label:"Estate", pairCount:10, description:"A 10-pair estate round with no preview by default.", previewMs:0, hintLimit:1, timeLimitSeconds:120, moveLimit:22, multiplier:1.55 },
  { id:"master-gardener", label:"Master Gardener", pairCount:12, description:"The 12-pair flagship challenge with minimal assistance.", previewMs:0, hintLimit:1, timeLimitSeconds:135, moveLimit:26, multiplier:2 },
];

export const gardenMatchCollectionCatalog = [
  { id:"herbs", title:"Herbs", subtitle:"Aromatic leaves of the Herb Walk", description:"Match fragrant herbs with their scents, kitchen uses, and tea traditions.", emoji:"🌿", unlockRequirement:{ type:"always", value:0, label:"Open from the first garden stroll" }, badge:"Herb Walk Sprig", completionFact:"Many culinary herbs are most aromatic shortly before flowering.", themeLabel:"Herb Walk", areaId:"herb-walk" },
  { id:"tea-garden", title:"Tea Garden", subtitle:"Infusions from the Tea Corridor", description:"Pair estate tea herbs with the cups, aromas, and traditions they inspire.", emoji:"🍵", unlockRequirement:{ type:"always", value:0, label:"Open from the first garden stroll" }, badge:"Tea Corridor Cup", completionFact:"Tea blends can be built in layers: a base note, a bright note, and an aromatic accent.", themeLabel:"Tea Corridor", areaId:"tea-corridor" },
  { id:"orchard", title:"Orchard Fruit", subtitle:"Treasures along the Orchard Path", description:"Pair orchard trees with their fruit, blossoms, and harvest clues.", emoji:"🍎", unlockRequirement:{ type:"always", value:0, label:"Open from the first garden stroll" }, badge:"Orchard Path Bough", completionFact:"Many orchard fruits form on short-lived fruiting spurs or carefully renewed wood.", themeLabel:"Orchard Path", areaId:"orchard-path" },
  { id:"flowers", title:"Flowers", subtitle:"The estate's flowering borders", description:"Pair estate flowers with their blooms, features, and favorite visitors.", emoji:"🌸", unlockRequirement:{ type:"always", value:0, label:"Open from the first garden stroll" }, badge:"Border Bloom", completionFact:"Layered bloom times keep an estate border lively across the seasons.", themeLabel:"Rose Court", areaId:"rose-court" },
  { id:"roses", title:"Roses", subtitle:"Heirloom blooms of the Rose Court", description:"Match treasured roses with color, form, fragrance, and garden character.", emoji:"🌹", unlockRequirement:{ type:"completed", value:1, label:"Complete 1 collection" }, badge:"Rose Court Rosette", completionFact:"Rose fragrance changes with temperature, humidity, and time of day.", themeLabel:"Rose Court", areaId:"rose-court" },
  { id:"pollinators", title:"Pollinators", subtitle:"Winged guests of the meadow", description:"Meet the bees, butterflies, moths, and other visitors that move pollen through the garden.", emoji:"🦋", unlockRequirement:{ type:"completed", value:2, label:"Complete 2 collections" }, badge:"Pollinator Crest", completionFact:"Different flower shapes welcome different pollinators.", themeLabel:"Pollinator Meadow", areaId:"pollinator-meadow" },
  { id:"vegetables", title:"Vegetables", subtitle:"Harvests from the kitchen garden", description:"Connect garden plants with the vegetables they bring to the table.", emoji:"🥕", unlockRequirement:{ type:"always", value:0, label:"Open from the first garden stroll" }, badge:"Kitchen Garden Basket", completionFact:"Harvesting young vegetables often encourages the plant to keep producing.", themeLabel:"Kitchen Garden", areaId:"pollinator-meadow" },
  { id:"moon-garden", title:"Moon Garden", subtitle:"Silver foliage after dusk", description:"Pair pale flowers, fragrant evening blooms, and moonlit garden details.", emoji:"🌙", unlockRequirement:{ type:"completed", value:3, label:"Complete 3 collections" }, badge:"Moon Garden Seal", completionFact:"White flowers and silver foliage remain visible after sunset by reflecting available light.", themeLabel:"Moon Garden", areaId:"moon-garden" },
  { id:"garden-tools", title:"Garden Tools", subtitle:"The estate gardener's cabinet", description:"Match well-loved tools with the task each performs in the garden.", emoji:"🧰", unlockRequirement:{ type:"completed", value:1, label:"Complete 1 collection" }, badge:"Gardener's Key", completionFact:"Clean, sharp tools make more precise cuts and are easier on plants and hands.", themeLabel:"Orchard Workshop", areaId:"orchard-path" },
  { id:"birds", title:"Birds of Jardin Soleil", subtitle:"Songs above the garden paths", description:"Pair familiar estate birds with their markings, songs, and garden habits.", emoji:"🐦", unlockRequirement:{ type:"completed", value:2, label:"Complete 2 collections" }, badge:"Songbird Crest", completionFact:"A garden with layered shrubs, water, and seed-bearing plants offers birds more places to feed and shelter.", themeLabel:"Pollinator Meadow", areaId:"pollinator-meadow" },
  { id:"seasonal-garden", title:"Seasonal Garden", subtitle:"The estate through the turning year", description:"Gather seasonal flowers, harvests, weather signs, and conservatory treasures.", emoji:"🍂", unlockRequirement:{ type:"seasonal", value:0, label:"Available in its season once discovered" }, badge:"Four Seasons Seal", completionFact:"Seasonal observation helps gardeners time planting, pruning, harvest, and habitat care.", themeLabel:"Seasonal Estate", areaId:"moon-garden", seasonal:true },
  { id:"garden-pests", title:"Garden Pests", subtitle:"Clues from the plant-health ledger", description:"Match common garden visitors with gentle, practical responses.", emoji:"🐞", unlockRequirement:{ type:"always", value:0, label:"Open from the first garden stroll" }, badge:"Garden Guardian", completionFact:"Regular inspection makes it easier to notice changes before they become widespread.", themeLabel:"Herb Walk", areaId:"herb-walk" },
  { id:"garden-vocabulary", title:"Garden Vocabulary", subtitle:"Language from the botanical journal", description:"Connect useful botanical terms with their plain-language meanings.", emoji:"📖", unlockRequirement:{ type:"always", value:0, label:"Open from the first garden stroll" }, badge:"Botanical Lexicon", completionFact:"Shared vocabulary helps gardeners describe plant growth and care more precisely.", themeLabel:"Tea Corridor", areaId:"tea-corridor" },
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

const createEstatePairCards = (category, pairStyle, entries) => createCategoryCards(
  category,
  pairStyle,
  entries.map(({ id, name, icon, match, matchIcon, fact, cardType = "botanical", matchType = "feature", rarity, season }) => ({
    id,
    name,
    icon,
    shortFact:fact,
    rarity,
    season,
    first:{ title:name, emoji:icon, description:fact, cardType },
    second:{ title:match, emoji:matchIcon, description:fact, cardType:matchType },
  })),
);

const teaGardenCards = createEstatePairCards("tea-garden", "herb-to-cup", [
  { id:"mint-cup", name:"Garden Mint", icon:"🌿", match:"Fresh Green Cup", matchIcon:"🍵", fact:"Mint leaves release their brightest aroma when gently bruised." },
  { id:"chamomile-cup", name:"Chamomile", icon:"🌼", match:"Golden Floral Cup", matchIcon:"☕", fact:"Chamomile's small flower heads carry a soft apple-like aroma." },
  { id:"lemon-balm-cup", name:"Lemon Balm", icon:"🍃", match:"Citrus Garden Cup", matchIcon:"🍋", fact:"Lemon balm belongs to the mint family and has square stems." },
  { id:"lavender-cup", name:"Lavender", icon:"🪻", match:"Fragrant Accent", matchIcon:"💜", fact:"A small amount of lavender adds a distinctly floral aroma to a blend." },
  { id:"rose-cup", name:"Rose Petals", icon:"🌹", match:"Blush Infusion", matchIcon:"🫖", fact:"Fragrant rose petals are often used as a delicate aromatic accent." },
  { id:"bee-balm-cup", name:"Bee Balm", icon:"🌺", match:"Ruby Garden Cup", matchIcon:"🍵", fact:"Bee balm's tufted flowers are a familiar sight in pollinator borders." },
  { id:"sage-cup", name:"Garden Sage", icon:"🌿", match:"Silver Leaf Blend", matchIcon:"🫖", fact:"Sage leaves are softly textured and silvery green." },
  { id:"thyme-cup", name:"Lemon Thyme", icon:"🌱", match:"Bright Herbal Note", matchIcon:"🍋", fact:"Lemon thyme combines tiny thyme leaves with a clear citrus scent." },
  { id:"hibiscus-cup", name:"Hibiscus", icon:"🌺", match:"Crimson Cup", matchIcon:"🍷", fact:"Hibiscus calyces create a vivid ruby-colored infusion." },
  { id:"jasmine-cup", name:"Jasmine", icon:"🌼", match:"Perfumed Tea Note", matchIcon:"✨", fact:"Jasmine flowers are prized for their intense evening fragrance." },
  { id:"calendula-cup", name:"Calendula", icon:"🌼", match:"Golden Petal Accent", matchIcon:"☀️", fact:"Calendula petals add warm golden color to botanical blends." },
  { id:"rosemary-cup", name:"Rosemary", icon:"🌿", match:"Woodland Aroma", matchIcon:"🌲", fact:"Rosemary's needle-like leaves carry a resinous evergreen scent." },
]);

const roseCards = createEstatePairCards("roses", "rose-to-character", [
  { id:"damask", name:"Damask Rose", icon:"🌹", match:"Old Garden Fragrance", matchIcon:"💗", fact:"Damask roses are celebrated for their rich old-rose fragrance." },
  { id:"tea", name:"Tea Rose", icon:"🌹", match:"High-Centered Bloom", matchIcon:"🏵️", fact:"Tea roses helped shape the elegant form of many modern roses." },
  { id:"moss", name:"Moss Rose", icon:"🌹", match:"Mossy Bud", matchIcon:"🌿", fact:"Moss roses have resinous, moss-like growth around their buds." },
  { id:"alba", name:"Alba Rose", icon:"🤍", match:"Pale Summer Bloom", matchIcon:"🌸", fact:"Alba roses are known for pale flowers and blue-green foliage." },
  { id:"gallica", name:"Gallica Rose", icon:"🌹", match:"Crimson Heirloom", matchIcon:"♦️", fact:"Gallica roses are compact old garden roses with richly colored blooms." },
  { id:"bourbon", name:"Bourbon Rose", icon:"🌹", match:"Repeating Fragrance", matchIcon:"🔄", fact:"Many Bourbon roses combine fragrance with repeat flowering." },
  { id:"noisette", name:"Noisette Rose", icon:"🌸", match:"Climbing Clusters", matchIcon:"🏡", fact:"Noisette roses often carry graceful clusters on climbing canes." },
  { id:"rugosa", name:"Rugosa Rose", icon:"🌹", match:"Textured Leaf", matchIcon:"🍃", fact:"Rugosa roses have strongly veined leaves and prominent hips." },
  { id:"rambling", name:"Rambling Rose", icon:"🌸", match:"Arching Garland", matchIcon:"〰️", fact:"Ramblers send long flexible canes through arbours and old trees." },
  { id:"miniature", name:"Miniature Rose", icon:"🌹", match:"Petite Bloom", matchIcon:"🤏", fact:"Miniature roses keep familiar rose form on a smaller scale." },
  { id:"floribunda", name:"Floribunda Rose", icon:"🌹", match:"Bouquet Clusters", matchIcon:"💐", fact:"Floribundas carry multiple flowers together in generous clusters." },
  { id:"climber", name:"Climbing Rose", icon:"🌹", match:"Estate Wall", matchIcon:"🏰", fact:"Climbing roses can be trained along walls, pillars, and pergolas." },
]);

const pollinatorCards = createEstatePairCards("pollinators", "visitor-to-flower", [
  { id:"honeybee", name:"Honeybee", icon:"🐝", match:"Lavender Drift", matchIcon:"🪻", fact:"Honeybees communicate productive flower locations through movement." },
  { id:"bumblebee", name:"Bumblebee", icon:"🐝", match:"Foxglove Bell", matchIcon:"🌺", fact:"Bumblebees can vibrate flowers to release pollen." },
  { id:"monarch", name:"Monarch Butterfly", icon:"🦋", match:"Milkweed", matchIcon:"🌿", fact:"Milkweed is the host plant for monarch caterpillars." },
  { id:"swallowtail", name:"Swallowtail", icon:"🦋", match:"Herb Umbel", matchIcon:"🌼", fact:"Swallowtail butterflies often visit broad, easy-to-land flower clusters." },
  { id:"hummingbird", name:"Hummingbird", icon:"🐦", match:"Tubular Bloom", matchIcon:"🌺", fact:"Long tubular flowers suit a hummingbird's hovering feeding style." },
  { id:"hoverfly", name:"Hoverfly", icon:"🪰", match:"Open Daisy", matchIcon:"🌼", fact:"Hoverflies resemble small bees but have one pair of wings." },
  { id:"mason-bee", name:"Mason Bee", icon:"🐝", match:"Orchard Blossom", matchIcon:"🌸", fact:"Mason bees are active orchard pollinators in cool spring weather." },
  { id:"hawk-moth", name:"Hawk Moth", icon:"🦋", match:"Evening Jasmine", matchIcon:"🌼", fact:"Some moths visit pale, fragrant flowers after dusk." },
  { id:"ladybird", name:"Ladybird Beetle", icon:"🐞", match:"Aphid Colony", matchIcon:"🍃", fact:"Ladybird beetles and their larvae are familiar garden predators." },
  { id:"leafcutter-bee", name:"Leafcutter Bee", icon:"🐝", match:"Neat Leaf Circle", matchIcon:"🟢", fact:"Leafcutter bees line their nests with carefully cut leaf pieces." },
  { id:"painted-lady", name:"Painted Lady", icon:"🦋", match:"Zinnia Landing", matchIcon:"🌺", fact:"Flat zinnia blooms make convenient butterfly landing platforms." },
  { id:"dragonfly", name:"Dragonfly", icon:"🪻", match:"Garden Pond", matchIcon:"💧", fact:"Dragonflies begin life underwater before patrolling the air." },
]);

const moonGardenCards = createEstatePairCards("moon-garden", "plant-to-night-clue", [
  { id:"moonflower", name:"Moonflower", icon:"🤍", match:"Dusk-Opening Trumpet", matchIcon:"🌙", fact:"Moonflowers unfurl large pale blooms toward evening." },
  { id:"lambs-ear", name:"Lamb's Ear", icon:"🍃", match:"Silver Velvet Leaf", matchIcon:"✨", fact:"Dense leaf hairs give lamb's ear its soft silver appearance." },
  { id:"white-rose", name:"White Rose", icon:"🤍", match:"Moonlit Petals", matchIcon:"🌹", fact:"Pale petals remain visible longer as daylight fades." },
  { id:"dusty-miller", name:"Dusty Miller", icon:"🌿", match:"Silver Border", matchIcon:"🌙", fact:"Dusty miller's divided leaves bring bright contrast to evening beds." },
  { id:"night-phlox", name:"Night Phlox", icon:"🌸", match:"Evening Fragrance", matchIcon:"✨", fact:"Night phlox becomes especially fragrant after sunset." },
  { id:"white-cosmos", name:"White Cosmos", icon:"🌼", match:"Starry Bloom", matchIcon:"⭐", fact:"Cosmos flowers rise on airy stems that move gently in a breeze." },
  { id:"artemisia", name:"Artemisia", icon:"🌿", match:"Feathery Silver", matchIcon:"🪶", fact:"Many artemisias carry finely divided aromatic silver foliage." },
  { id:"nicotiana", name:"Flowering Tobacco", icon:"🌸", match:"Twilight Trumpets", matchIcon:"🌙", fact:"Some flowering tobacco varieties release fragrance in the evening." },
  { id:"white-hydrangea", name:"White Hydrangea", icon:"🤍", match:"Cloudlike Cluster", matchIcon:"☁️", fact:"Each hydrangea cluster is made of many small flowers." },
  { id:"snowdrop", name:"Snowdrop", icon:"🤍", match:"Winter Lantern", matchIcon:"🏮", fact:"Snowdrops often bloom while the garden is still wintry." },
  { id:"jasmine", name:"Star Jasmine", icon:"🌼", match:"Perfumed Vine", matchIcon:"〰️", fact:"Star jasmine combines glossy evergreen foliage with pale fragrant flowers." },
  { id:"evening-primrose", name:"Evening Primrose", icon:"🌼", match:"Sunset Bloom", matchIcon:"🌅", fact:"Evening primrose flowers often open late in the day." },
]);

const toolCards = createEstatePairCards("garden-tools", "tool-to-task", [
  { id:"secateurs", name:"Secateurs", icon:"✂️", match:"Precise Pruning", matchIcon:"🌿", fact:"Clean, sharp secateurs leave a smoother cut." },
  { id:"trowel", name:"Hand Trowel", icon:"🛠️", match:"Planting Pocket", matchIcon:"🪴", fact:"A hand trowel is sized for planting and potting at close range." },
  { id:"fork", name:"Garden Fork", icon:"🔱", match:"Loosen Soil", matchIcon:"🟤", fact:"A fork lifts and loosens soil with less slicing than a spade." },
  { id:"watering-can", name:"Watering Can", icon:"🪣", match:"Gentle Watering", matchIcon:"💧", fact:"A rose fitting spreads water into a softer shower." },
  { id:"dibber", name:"Dibber", icon:"🪵", match:"Seed Hole", matchIcon:"🌱", fact:"A dibber makes evenly measured planting holes." },
  { id:"rake", name:"Garden Rake", icon:"🧹", match:"Level Seedbed", matchIcon:"〰️", fact:"A rake breaks small clods and levels prepared soil." },
  { id:"spade", name:"Border Spade", icon:"♠️", match:"Crisp Edge", matchIcon:"✦", fact:"A border spade has a compact blade for controlled digging." },
  { id:"hoe", name:"Draw Hoe", icon:"⛏️", match:"Young Weeds", matchIcon:"🌱", fact:"Hoeing on a dry day exposes small weeds to sun and air." },
  { id:"twine", name:"Garden Twine", icon:"🧵", match:"Tie a Climber", matchIcon:"〰️", fact:"Soft ties leave room for stems to thicken." },
  { id:"sieve", name:"Soil Sieve", icon:"🧺", match:"Fine Potting Mix", matchIcon:"🟤", fact:"A sieve separates coarse pieces from fine soil or compost." },
  { id:"bell-jar", name:"Garden Cloche", icon:"🔔", match:"Shelter Seedling", matchIcon:"🌱", fact:"A cloche creates a small sheltered pocket around a plant." },
  { id:"trug", name:"Garden Trug", icon:"🧺", match:"Carry the Harvest", matchIcon:"🥕", fact:"A shallow trug keeps garden harvests visible and easy to sort." },
]);

const birdCards = createEstatePairCards("birds", "bird-to-clue", [
  { id:"robin", name:"Robin", icon:"🐦", match:"Rust-Red Breast", matchIcon:"🧡", fact:"Robins often forage close to freshly worked garden soil." },
  { id:"bluebird", name:"Eastern Bluebird", icon:"🐦", match:"Blue Back", matchIcon:"💙", fact:"Bluebirds favor open garden edges with nearby perches." },
  { id:"cardinal", name:"Cardinal", icon:"🐦", match:"Crimson Crest", matchIcon:"❤️", fact:"Male northern cardinals are recognizable by vivid red plumage." },
  { id:"goldfinch", name:"Goldfinch", icon:"🐦", match:"Golden Finch", matchIcon:"💛", fact:"Goldfinches visit seed heads left standing in the garden." },
  { id:"wren", name:"House Wren", icon:"🐦", match:"Bubbly Song", matchIcon:"🎵", fact:"Wrens are small birds with energetic, cascading songs." },
  { id:"chickadee", name:"Chickadee", icon:"🐦", match:"Black Cap", matchIcon:"🖤", fact:"Chickadees inspect bark and twigs for small insects." },
  { id:"mockingbird", name:"Mockingbird", icon:"🐦", match:"Borrowed Songs", matchIcon:"🎶", fact:"Mockingbirds weave imitated sounds into long performances." },
  { id:"woodpecker", name:"Downy Woodpecker", icon:"🐦", match:"Tapping Trunk", matchIcon:"🪵", fact:"Woodpeckers brace against bark with stiff tail feathers." },
  { id:"hummingbird", name:"Ruby-throated Hummingbird", icon:"🐦", match:"Hovering Visitor", matchIcon:"🌺", fact:"Hummingbirds can hover while feeding at tubular flowers." },
  { id:"oriole", name:"Baltimore Oriole", icon:"🐦", match:"Orange-and-Black", matchIcon:"🧡", fact:"Orioles weave hanging nests high in deciduous trees." },
  { id:"catbird", name:"Gray Catbird", icon:"🐦", match:"Slate Garden Singer", matchIcon:"🩶", fact:"Catbirds often shelter and forage in dense shrubs." },
  { id:"sparrow", name:"Song Sparrow", icon:"🐦", match:"Striped Breast", matchIcon:"🤎", fact:"Song sparrows often sing from low, exposed garden perches." },
]);

const seasonalCards = createEstatePairCards("seasonal-garden", "season-to-estate-clue", [
  { id:"spring-tulip", name:"Spring Tulips", icon:"🌷", match:"April Border", matchIcon:"🌦️", fact:"Tulip bulbs build their flower underground before spring.", season:"spring" },
  { id:"spring-blossom", name:"Orchard Blossom", icon:"🌸", match:"Spring Branch", matchIcon:"🌿", fact:"Orchard bloom arrives before the leafy canopy is fully developed.", season:"spring" },
  { id:"spring-nest", name:"Garden Nest", icon:"🪺", match:"New Season", matchIcon:"🐣", fact:"Dense hedges provide sheltered places for many garden birds.", season:"spring" },
  { id:"summer-sunflower", name:"Summer Sunflower", icon:"🌻", match:"High Sun", matchIcon:"☀️", fact:"Sunflower heads track the sun while young.", season:"summer" },
  { id:"summer-tomato", name:"Summer Tomato", icon:"🍅", match:"Kitchen Harvest", matchIcon:"🧺", fact:"Regular harvesting keeps the summer kitchen garden productive.", season:"summer" },
  { id:"summer-lavender", name:"Lavender Drift", icon:"🪻", match:"Bee Season", matchIcon:"🐝", fact:"Lavender flower spikes are busy pollinator gathering places.", season:"summer" },
  { id:"autumn-apple", name:"Autumn Apple", icon:"🍎", match:"Orchard Basket", matchIcon:"🧺", fact:"Different apple cultivars ripen across a long harvest season.", season:"autumn" },
  { id:"autumn-leaf", name:"Turning Leaf", icon:"🍂", match:"Amber Path", matchIcon:"🍁", fact:"Leaf colors emerge as green chlorophyll fades.", season:"autumn" },
  { id:"autumn-pumpkin", name:"Pumpkin", icon:"🎃", match:"Harvest Display", matchIcon:"🌾", fact:"Pumpkins develop their hard rind as they mature.", season:"autumn" },
  { id:"winter-holly", name:"Winter Holly", icon:"🌿", match:"Evergreen Accent", matchIcon:"🔴", fact:"Evergreen foliage gives the winter garden lasting structure.", season:"winter" },
  { id:"winter-snowdrop", name:"Snowdrop", icon:"🤍", match:"Late-Winter Bloom", matchIcon:"❄️", fact:"Snowdrops can emerge through very cold late-winter ground.", season:"winter" },
  { id:"winter-conservatory", name:"Conservatory Citrus", icon:"🍋", match:"Winter Glasshouse", matchIcon:"🏡", fact:"A sheltered conservatory extends the estate's growing season.", season:"winter" },
]);

export const gardenMatchCards = [
  ...orchardCards,
  ...herbCards,
  ...teaGardenCards,
  ...vegetableCards,
  ...flowerCards,
  ...roseCards,
  ...pollinatorCards,
  ...moonGardenCards,
  ...toolCards,
  ...birdCards,
  ...seasonalCards,
  ...pestCards,
  ...vocabularyCards,
];

export const gardenMatchPairs = [...gardenMatchCards.reduce((pairs, card) => {
  if (!pairs.has(card.pairId)) {
    pairs.set(card.pairId, {
      id:card.pairId,
      name:card.name,
      icon:card.icon,
      shortFact:card.shortFact,
      category:card.category,
      rarity:card.rarity,
      collectionId:card.collectionId,
      season:card.season,
    });
  }
  return pairs;
}, new Map()).values()];

export const gardenMatchCollections = gardenMatchCollectionCatalog.map((collection) => ({
  ...collection,
  label:collection.title,
  cards:gardenMatchPairs.filter((pair) => pair.collectionId === collection.id),
}));

// Compatibility export retained for the existing game route and saved score IDs.
export const gardenMatchCategories = gardenMatchCollections;

export const gardenMatchJourneyAreas = [
  { id:"herb-walk", title:"Herb Walk", icon:"🌿", description:"A fragrant path of culinary leaves and garden remedies.", unlockCollections:["herbs","garden-pests"], rewardId:"lavender-linen" },
  { id:"tea-corridor", title:"Tea Corridor", icon:"🍵", description:"An intimate passage from aromatic leaf to treasured cup.", unlockCollections:["tea-garden","garden-vocabulary"], rewardId:"tea-corridor-seal" },
  { id:"orchard-path", title:"Orchard Path", icon:"🍎", description:"Fruit trees, trained branches, and the estate gardener's tools.", unlockCollections:["orchard","garden-tools"], rewardId:"orchard-gold" },
  { id:"rose-court", title:"Rose Court", icon:"🌹", description:"Formal borders filled with heirloom color and fragrance.", unlockCollections:["flowers","roses"], rewardId:"botanical-frame" },
  { id:"pollinator-meadow", title:"Pollinator Meadow", icon:"🦋", description:"A lively meadow of vegetables, birds, bees, and butterflies.", unlockCollections:["vegetables","pollinators","birds"], rewardId:"pollinator-crest" },
  { id:"moon-garden", title:"Moon Garden", icon:"🌙", description:"Silver leaves and pale flowers gathered beneath the stars.", unlockCollections:["moon-garden","seasonal-garden"], rewardId:"moon-silver" },
];

export const gardenMatchRewards = [
  { id:"lavender-linen", title:"Lavender Linen", type:"card-back", description:"A soft lavender card back from the Herb Walk." },
  { id:"tea-corridor-seal", title:"Tea Corridor Seal", type:"seal", description:"A pressed-leaf seal for tea-garden study." },
  { id:"orchard-gold", title:"Orchard Gold", type:"card-back", description:"A warm orchard-gold card back with espalier detail." },
  { id:"botanical-frame", title:"Botanical Frame", type:"frame", description:"A watercolor flower frame for mastered collections." },
  { id:"pollinator-crest", title:"Pollinator Crest", type:"crest", description:"A meadow crest for welcoming estate pollinators." },
  { id:"moon-silver", title:"Moon Silver", type:"card-back", description:"A silver card back inspired by the Moon Garden." },
  { id:"buddy-ribbon", title:"Buddy's Garden Ribbon", type:"buddy-ribbon", description:"A cheerful estate ribbon awarded for a daily streak." },
];

export const gardenMatchSeasons = [
  { id:"spring", label:"Spring", months:[2,3,4], icon:"🌷" },
  { id:"summer", label:"Summer", months:[5,6,7], icon:"☀️" },
  { id:"autumn", label:"Autumn", months:[8,9,10], icon:"🍂" },
  { id:"winter", label:"Winter", months:[11,0,1], icon:"❄️" },
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
  "garden-tool":"Garden tool",
  bird:"Estate bird",
  pollinator:"Pollinator",
};
