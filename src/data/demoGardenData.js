const createdAt = "2026-01-15T12:00:00.000Z";

export const demoGardenData = {
  profile: {
    id: "garden_sample_jardin",
    gardenName: "Sample Garden",
    ownerDisplayName: "",
    gardenType: ["Mixed Garden", "Pollinator Garden"],
    climateZone: "7b",
    hemisphere: "northern",
    locationLabel: "Fictional sample location",
    units: "imperial",
    createdAt,
    onboardingCompleted: true,
    sampleGardenEnabled: true,
  },
  plants: [
    { id:"sample-tomato", commonName:"Tomato", name:"Patio Tomato", type:"Tomato", category:"Vegetables", variety:"Sungold", quantity:2, zoneId:"sample-kitchen-beds", gardenZone:"Kitchen Beds", plantingMethod:"Seedling", status:"Growing", healthStatus:"Healthy", health:94, createdAt },
    { id:"sample-basil", commonName:"Basil", name:"Sweet Basil", type:"Basil", category:"Herbs", variety:"Genovese", quantity:3, zoneId:"sample-herb-terrace", gardenZone:"Herb Terrace", plantingMethod:"Seed", status:"Growing", healthStatus:"Healthy", health:97, createdAt },
    { id:"sample-strawberry", commonName:"Strawberry", name:"Strawberries", type:"Strawberry", category:"Fruits", variety:"Albion", quantity:6, zoneId:"sample-kitchen-beds", gardenZone:"Kitchen Beds", plantingMethod:"Established Plant", status:"Flowering", healthStatus:"Healthy", health:92, createdAt },
    { id:"sample-apple", commonName:"Apple", name:"Apple Tree", type:"Fruit Tree", category:"Fruit Trees", variety:"Liberty", quantity:1, zoneId:"sample-orchard", gardenZone:"Small Orchard", plantingMethod:"Tree", status:"Growing", healthStatus:"Healthy", health:95, createdAt },
    { id:"sample-lavender", commonName:"Lavender", name:"English Lavender", type:"Lavender", category:"Herbs", variety:"Hidcote", quantity:4, zoneId:"sample-herb-terrace", gardenZone:"Herb Terrace", plantingMethod:"Transplant", status:"Blooming", healthStatus:"Healthy", health:96, createdAt },
  ],
  zones: [
    { id:"sample-kitchen-beds", name:"Kitchen Beds", type:"Raised beds", description:"Fictional vegetables and berries for product exploration.", sunlight:"Full sun", soil:"Compost-rich loam", irrigation:"Drip line", notes:"Sample record", createdAt, archived:false },
    { id:"sample-herb-terrace", name:"Herb Terrace", type:"Container garden", description:"A fictional aromatic herb collection.", sunlight:"Full sun", soil:"Free-draining potting mix", irrigation:"Hand watered", notes:"Sample record", createdAt, archived:false },
    { id:"sample-orchard", name:"Small Orchard", type:"Orchard", description:"A fictional demonstration fruit-tree zone.", sunlight:"Full sun", soil:"Well-drained loam", irrigation:"Deep watering", notes:"Sample record", createdAt, archived:false },
  ],
  journalEntries: [
    { id:"sample-note-1", title:"First blossoms", type:"Observation", notes:"The sample strawberries opened their first flowers.", date:"2026-05-10", createdAt:"2026-05-10T09:30:00.000Z", plantId:"sample-strawberry", gardenZone:"Kitchen Beds", sampleRecord:true },
  ],
  photos: [],
  healthCases: [],
  plantIdentifications: [],
  teaWorkflows: [],
  tasks: [
    { id:"sample-task-1", title:"Water the Kitchen Beds", dueDate:"", completed:false, source:"Sample Garden", createdAt, sampleRecord:true },
    { id:"sample-task-2", title:"Check the apple tree ties", dueDate:"", completed:false, source:"Sample Garden", createdAt, sampleRecord:true },
  ],
  buddyGardenLogs: [],
  inventoryItems: [],
  teaRecipes: [],
  calendarEntries: [],
  lastTaskRefreshDate: "",
};
