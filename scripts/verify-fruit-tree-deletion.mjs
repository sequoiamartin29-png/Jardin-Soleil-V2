import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const portOffset = process.pid % 200;
const previewPort = 4300 + portOffset;
const debuggingPort = 9400 + portOffset;
const appUrl = `http://127.0.0.1:${previewPort}`;
const storageKey = "jardinSoleilGardenStateV2";
const activePageKey = "jardinSoleilActivePage";
const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFor(check, message, timeout = 18000) {
  const deadline = Date.now() + timeout;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await sleep(100);
  }
  throw new Error(`${message}${lastError ? `: ${lastError.message}` : ""}`);
}

async function findBrowser() {
  for (const candidate of chromeCandidates) {
    try {
      await readFile(candidate);
      return candidate;
    } catch {
      // Keep checking standard browser locations.
    }
  }
  throw new Error("Chrome or Edge was not found in a standard installation location.");
}

class Cdp {
  constructor(webSocketUrl) {
    this.nextId = 0;
    this.pending = new Map();
    this.socket = new WebSocket(webSocketUrl);
  }

  async connect() {
    if (this.socket.readyState !== WebSocket.OPEN) {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Timed out while connecting to the browser target.")), 10000);
        this.socket.addEventListener("open", () => { clearTimeout(timer); resolve(); }, { once:true });
        this.socket.addEventListener("error", (error) => { clearTimeout(timer); reject(error); }, { once:true });
      });
    }
    this.socket.addEventListener("message", async (event) => {
      const raw = typeof event.data === "string"
        ? event.data
        : typeof event.data?.text === "function"
          ? await event.data.text()
          : new TextDecoder().decode(event.data);
      const message = JSON.parse(raw);
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timer);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
    console.log("QA · enabling browser runtime");
    await this.send("Runtime.enable");
    console.log("QA · enabling browser page");
    await this.send("Page.enable");
  }

  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timed out waiting for ${method}.`));
      }, 10000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise:true,
      returnByValue:true,
      userGesture:true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    }
    return result.result.value;
  }

  close() {
    this.socket.close();
  }
}

const byText = (selector, text) => `(() => {
  const target = ${JSON.stringify(text)};
  const element = [...document.querySelectorAll(${JSON.stringify(selector)})]
    .find((item) => item.textContent.replace(/\\s+/g, " ").trim().includes(target));
  if (!element) return false;
  element.click();
  return true;
})()`;

const inCard = (plantName, buttonText, click = true) => `(() => {
  const card = [...document.querySelectorAll("article")]
    .find((item) => item.textContent.includes(${JSON.stringify(plantName)}));
  const button = [...(card?.querySelectorAll("button") || [])]
    .find((item) => item.textContent.replace(/\\s+/g, " ").trim().includes(${JSON.stringify(buttonText)}));
  if (!button) return false;
  if (${click}) button.click();
  return true;
})()`;

const dialogInput = (value) => `(() => {
  const element = document.querySelector(".js-plant-delete input");
  if (!element) return false;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(element, ${JSON.stringify(value)});
  element.dispatchEvent(new Event("input", { bubbles:true }));
  element.dispatchEvent(new Event("change", { bubbles:true }));
  return true;
})()`;

const stateExpression = `JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)}))`;
const treeNames = ["August Last", "Fruit Snacks Sweet Sensation Peach"];
const createdAt = "2026-07-01T12:00:00.000Z";
const seedState = {
  schemaVersion:2,
  profile:{
    id:"garden-fruit-tree-delete-qa",
    gardenName:"Fruit Tree Delete QA",
    gardenType:["Orchard"],
    climateZone:"7b",
    hemisphere:"northern",
    units:"imperial",
    createdAt,
    onboardingCompleted:true,
    sampleGardenEnabled:false,
  },
  onboardingDraft:{ step:0, mode:"", profile:{}, zones:[], plants:[] },
  plants:[
    { id:"tree-august-last", name:"August Last", commonName:"Plum", type:"Plum", category:"Fruit Trees", group:"Plums", quantity:1, zoneId:"qa-orchard", gardenZone:"QA Orchard", status:"Growing", health:91, createdAt },
    { id:"tree-fruit-snacks", name:"Fruit Snacks Sweet Sensation Peach", commonName:"Peach", type:"Peach", category:"Fruit Trees", group:"Peach / Stone Fruit", quantity:1, zoneId:"qa-orchard", gardenZone:"QA Orchard", status:"Growing", health:94, createdAt },
  ],
  zones:[{ id:"qa-orchard", name:"QA Orchard", type:"Orchard", createdAt, archived:false }],
  journalEntries:[
    { id:"journal-august-care", plantId:"tree-august-last", type:"Watering", title:"Watering", careEvent:true, nextDueDate:"2099-08-01", notes:"Deep watered.", date:"2026-07-20", createdAt:"2026-07-20T12:00:00.000Z" },
    { id:"journal-august-harvest", plantId:"tree-august-last", type:"Harvest", title:"August Last harvest", notes:"Historic harvest.", date:"2026-07-21", createdAt:"2026-07-21T12:00:00.000Z" },
  ],
  photos:[{ id:"photo-august", plantId:"tree-august-last", name:"August Last bloom", date:createdAt, url:"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" }],
  healthCases:[{ id:"health-august", plantId:"tree-august-last", status:"Monitoring", workingDiagnosis:"Leaf curl watch", createdAt, updatedAt:createdAt }],
  plantIdentifications:[{ id:"identification-august", estatePlantId:"tree-august-last", selectedMatch:{ commonName:"Plum" }, createdAt, updatedAt:createdAt }],
  teaWorkflows:[{ id:"workflow-august", plantId:"tree-august-last", harvestDate:"2026-07-21", createdAt, updatedAt:createdAt }],
  tasks:[{ id:"task-august", title:"Inspect August Last", plantId:"tree-august-last", dueDate:"2099-08-01", completed:false, createdAt }],
  buddyGardenLogs:[{ id:"buddy-august", affectedPlantIds:["tree-august-last","tree-fruit-snacks"], confirmedActions:[{ id:"action-august", targetIds:["tree-august-last","tree-fruit-snacks"] }], createdAt }],
  inventoryItems:[{ id:"inventory-august", name:"August Last ties", plantId:"tree-august-last", createdAt, updatedAt:createdAt }],
  teaRecipes:[{ id:"recipe-august", name:"Orchard test", linkedPlantIds:["tree-august-last","tree-fruit-snacks"], createdAt, updatedAt:createdAt }],
  calendarEntries:[{ id:"calendar-august", title:"Inspect August Last", plantId:"tree-august-last", date:"2099-08-01", createdAt }],
  pendingPlantDeletions:[],
  lastTaskRefreshDate:"",
};

async function run() {
  const browserPath = await findBrowser();
  console.log("QA · browser located");
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "jardin-soleil-fruit-tree-delete-"));
  const browserProfile = path.join(tempRoot, "browser");
  const server = spawn(
    process.execPath,
    [path.join(projectRoot, "node_modules", "vite", "bin", "vite.js"), "preview", "--host", "127.0.0.1", "--port", String(previewPort)],
    { cwd:projectRoot, windowsHide:true, stdio:["ignore", "pipe", "pipe"] },
  );
  let serverOutput = "";
  server.stdout.on("data", (chunk) => { serverOutput += chunk; });
  server.stderr.on("data", (chunk) => { serverOutput += chunk; });

  let browser;
  let cdp;
  try {
    await waitFor(async () => (await fetch(appUrl)).ok, `Preview server did not start. ${serverOutput}`);
    console.log("QA · preview ready");
    browser = spawn(browserPath, [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--remote-allow-origins=*",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${debuggingPort}`,
      `--user-data-dir=${browserProfile}`,
      "--window-size=1100,1000",
      "about:blank",
    ], { windowsHide:true, stdio:"ignore" });

    const target = await waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${debuggingPort}/json/new?${encodeURIComponent(appUrl)}`, { method:"PUT" });
      return response.ok ? response.json() : null;
    }, "Browser debugging endpoint did not start.");
    console.log("QA · browser target ready");
    cdp = new Cdp(target.webSocketDebuggerUrl);
    await cdp.connect();
    console.log("QA · browser connected");
    await waitFor(() => cdp.evaluate("Boolean(document.body)"), "Application document did not load.");
    await cdp.evaluate(`localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(JSON.stringify(seedState))}); localStorage.setItem(${JSON.stringify(activePageKey)}, "Orchard"); true`);
    await cdp.send("Page.reload", { ignoreCache:true });
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Jardin Soleil Orchard')"), "Orchard did not open.");
    console.log("QA · named-tree fixture loaded");
    for (const name of treeNames) assert.equal(await cdp.evaluate(`document.body.innerText.includes(${JSON.stringify(name)})`), true);
    assert.equal(await cdp.evaluate("document.body.innerText.includes('2 fruit trees')"), true);

    assert.equal(await cdp.evaluate(inCard("August Last", "Delete Tree")), true);
    await waitFor(() => cdp.evaluate("document.querySelector('.js-plant-delete')?.innerText.includes('August Last')"), "Delete confirmation did not open.");
    assert.equal(await cdp.evaluate(byText(".js-plant-delete button", "Cancel")), true);
    assert.equal((await cdp.evaluate(stateExpression)).plants.some((plant) => plant.name === "August Last"), true);
    assert.equal(await cdp.evaluate("document.body.innerText.includes('August Last')"), true);
    console.log("PASS 01 · Orchard exposes Delete Tree and Cancel keeps August Last unchanged");

    assert.equal(await cdp.evaluate(inCard("August Last", "Open Plant Profile")), true);
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Individual Estate Record')"), "Tree profile did not open.");
    assert.equal(await cdp.evaluate(byText("button", "Delete Tree")), true);
    await cdp.evaluate(`localStorage.setItem(${JSON.stringify(activePageKey)}, "Orchard"); true`);
    await cdp.send("Page.reload", { ignoreCache:true });
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Jardin Soleil Orchard')"), "Orchard did not reopen.");
    console.log("PASS 02 · fruit-tree profile exposes Delete Tree");

    assert.equal(await cdp.evaluate(inCard("August Last", "Delete Tree")), true);
    assert.equal(await cdp.evaluate(byText(".js-plant-delete button", "Archive Tree")), true);
    await waitFor(async () => (await cdp.evaluate(stateExpression)).plants.find((plant) => plant.id === "tree-august-last")?.archived, "August Last did not archive.");
    let state = await cdp.evaluate(stateExpression);
    assert.equal(state.tasks.find((task) => task.id === "task-august").archived, true);
    assert.equal(state.healthCases.find((item) => item.id === "health-august").status, "Archived");
    await cdp.evaluate(`localStorage.setItem(${JSON.stringify(activePageKey)}, "Archived Plants"); true`);
    await cdp.send("Page.reload", { ignoreCache:true });
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Archived Plants')"), "Archived Plants did not open.");
    assert.equal(await cdp.evaluate(inCard("August Last", "Restore")), true);
    await waitFor(async () => !(await cdp.evaluate(stateExpression)).plants.find((plant) => plant.id === "tree-august-last")?.archived, "August Last did not restore.");
    state = await cdp.evaluate(stateExpression);
    assert.equal(state.tasks.find((task) => task.id === "task-august").archived, false);
    assert.equal(state.healthCases.find((item) => item.id === "health-august").status, "Monitoring");
    console.log("PASS 03 · Archive Tree preserves and restores the tree, task, and health case");

    await cdp.evaluate(`localStorage.setItem(${JSON.stringify(activePageKey)}, "Orchard"); true`);
    await cdp.send("Page.reload", { ignoreCache:true });
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Jardin Soleil Orchard')"), "Orchard did not reopen for deletion.");
    assert.equal(await cdp.evaluate(inCard("August Last", "Delete Tree")), true);
    assert.equal(await cdp.evaluate(dialogInput("August Last")), true);
    assert.equal(await cdp.evaluate(byText(".js-plant-delete button", "Delete Permanently")), true);
    await waitFor(async () => (await cdp.evaluate(stateExpression)).pendingPlantDeletions.some((item) => item.plantId === "tree-august-last"), "Permanent deletion was not scheduled.");
    assert.equal(await cdp.evaluate(inCard("August Last", "Open Plant Profile", false)), false);
    await cdp.send("Page.reload", { ignoreCache:true });
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Jardin Soleil Orchard')"), "Orchard did not survive refresh during deletion.");
    assert.equal(await cdp.evaluate(inCard("August Last", "Open Plant Profile", false)), false);
    await waitFor(async () => !(await cdp.evaluate(stateExpression)).plants.some((plant) => plant.id === "tree-august-last"), "August Last did not delete permanently.", 15000);
    state = await cdp.evaluate(stateExpression);
    for (const collection of ["journalEntries", "photos", "healthCases", "tasks", "teaWorkflows", "calendarEntries", "plantIdentifications", "inventoryItems"]) {
      const record = state[collection].find((item) => item.id?.includes("august"));
      assert.equal(record.plantDeleted, true, `${collection} did not preserve a deleted-plant marker`);
      assert.equal(record.deletedPlantName, "August Last", `${collection} did not preserve the former tree name`);
    }
    assert.deepEqual(state.buddyGardenLogs[0].affectedPlantIds, ["tree-fruit-snacks"]);
    assert.deepEqual(state.teaRecipes[0].linkedPlantIds, ["tree-fruit-snacks"]);
    assert.equal(state.healthCases[0].status, "Archived");
    assert.equal(state.tasks[0].archived, true);
    console.log("PASS 04 · August Last stays removed after refresh and all linked history remains safe");

    await cdp.evaluate(`localStorage.setItem(${JSON.stringify(activePageKey)}, "Dashboard"); true`);
    await cdp.send("Page.reload", { ignoreCache:true });
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Welcome to Fruit Tree Delete QA.')"), "Dashboard did not open.");
    const fruitCount = await cdp.evaluate(`Number([...document.querySelectorAll(".js-dashboard-stat-card")].find((card) => card.textContent.includes("Fruit Trees"))?.querySelector("strong")?.textContent)`);
    assert.equal(fruitCount, 1);
    const spotlight = await cdp.evaluate(`[...document.querySelectorAll("article")].find((item) => item.textContent.includes("Plant Spotlight"))?.querySelector("h2")?.textContent`);
    assert.notEqual(spotlight, "August Last");
    console.log("PASS 05 · dashboard count and Plant Spotlight update immediately");

    await cdp.evaluate(`localStorage.setItem(${JSON.stringify(activePageKey)}, "Plant Directory"); true`);
    await cdp.send("Page.reload", { ignoreCache:true });
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Plant Directory')"), "Plant Directory did not open.");
    assert.equal(await cdp.evaluate(inCard("Fruit Snacks Sweet Sensation Peach", "Delete Tree", false)), true);
    assert.equal(await cdp.evaluate(inCard("Fruit Snacks Sweet Sensation Peach", "Edit Plant")), true);
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Refine this estate record')"), "Tree editor did not open.");
    assert.equal(await cdp.evaluate(byText("button", "Delete Tree")), true);
    assert.equal(await cdp.evaluate(dialogInput("Fruit Snacks Sweet Sensation Peach")), true);
    assert.equal(await cdp.evaluate(byText(".js-plant-delete button", "Delete Permanently")), true);
    await waitFor(async () => !(await cdp.evaluate(stateExpression)).plants.some((plant) => plant.id === "tree-fruit-snacks"), "Fruit Snacks Sweet Sensation Peach did not delete permanently.", 15000);
    console.log("PASS 06 · Plant Directory and edit form expose Delete Tree, and the second named tree deletes permanently");

    await cdp.evaluate(`localStorage.setItem(${JSON.stringify(activePageKey)}, "Dashboard"); true`);
    await cdp.send("Page.reload", { ignoreCache:true });
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Welcome to Fruit Tree Delete QA.')"), "Dashboard did not reopen.");
    const finalFruitCount = await cdp.evaluate(`Number([...document.querySelectorAll(".js-dashboard-stat-card")].find((card) => card.textContent.includes("Fruit Trees"))?.querySelector("strong")?.textContent)`);
    assert.equal(finalFruitCount, 0);
    const finalSpotlight = await cdp.evaluate(`[...document.querySelectorAll("article")].find((item) => item.textContent.includes("Plant Spotlight"))?.querySelector("h2")?.textContent`);
    assert.equal(finalSpotlight, "No spotlight plant yet.");
    state = await cdp.evaluate(stateExpression);
    assert.equal(state.plants.length, 0);
    assert.equal(state.journalEntries.length, 2);
    assert.equal(state.photos.length, 1);
    assert.equal(state.healthCases.length, 1);
    assert.equal(state.tasks.length, 1);
    assert.equal(state.pendingPlantDeletions.length, 0);
    console.log("PASS 07 · both named trees are gone, counts are zero, and historical collections remain intact");
  } finally {
    cdp?.close();
    browser?.kill();
    server.kill();
    await sleep(1000);
    await rm(tempRoot, { recursive:true, force:true, maxRetries:5, retryDelay:250 });
  }
}

run().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
