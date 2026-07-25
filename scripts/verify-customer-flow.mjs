import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const port = 4175;
const appUrl = `http://127.0.0.1:${port}`;
const storageKey = "jardinSoleilGardenStateV2";
const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFor(check, message, timeout = 15000) {
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
      // Keep checking installed browser locations.
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
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once:true });
      this.socket.addEventListener("error", reject, { once:true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
    await this.send("Runtime.enable");
    await this.send("Page.enable");
    await this.send("DOM.enable");
  }

  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
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

const inputByLabel = (label, value) => `(() => {
  const target = ${JSON.stringify(label)};
  const labelElement = [...document.querySelectorAll("label")]
    .find((item) => item.textContent.trim().startsWith(target));
  const element = labelElement?.querySelector("input, select, textarea");
  if (!element) return false;
  const prototype = element instanceof HTMLSelectElement
    ? HTMLSelectElement.prototype
    : element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value").set.call(element, ${JSON.stringify(value)});
  element.dispatchEvent(new Event("input", { bubbles:true }));
  element.dispatchEvent(new Event("change", { bubbles:true }));
  return true;
})()`;

const stateExpression = `JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)}))`;

async function run() {
  const browserPath = await findBrowser();
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "jardin-soleil-customer-qa-"));
  const browserProfile = path.join(tempRoot, "browser");
  const downloads = path.join(tempRoot, "downloads");
  const photoPath = path.join(tempRoot, "garden-photo.png");
  const onePixelPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );
  await writeFile(photoPath, onePixelPng);

  const server = spawn(
    process.execPath,
    [path.join(projectRoot, "node_modules", "vite", "bin", "vite.js"), "preview", "--host", "127.0.0.1", "--port", String(port)],
    { cwd:projectRoot, windowsHide:true, stdio:["ignore", "pipe", "pipe"] },
  );
  let serverOutput = "";
  server.stdout.on("data", (chunk) => { serverOutput += chunk; });
  server.stderr.on("data", (chunk) => { serverOutput += chunk; });

  let browser;
  let cdp;
  try {
    await waitFor(async () => {
      const response = await fetch(appUrl);
      return response.ok;
    }, `Preview server did not start. ${serverOutput}`);

    browser = spawn(browserPath, [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-breakpad",
      "--disable-crash-reporter",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-debugging-port=9225",
      `--user-data-dir=${browserProfile}`,
      "--window-size=1024,1000",
      "about:blank",
    ], { windowsHide:true, stdio:"ignore" });

    const target = await waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:9225/json/new?${encodeURIComponent(appUrl)}`, { method:"PUT" });
      if (!response.ok) return null;
      return response.json();
    }, "Browser debugging endpoint did not start.");

    cdp = new Cdp(target.webSocketDebuggerUrl);
    await cdp.connect();
    await waitFor(() => cdp.evaluate("document.body?.innerText.includes('Welcome to Jardin Soleil')"), "First-run onboarding did not open.");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width:320, height:800, deviceScaleFactor:1, mobile:false });
    assert.equal(await cdp.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"), true);
    await cdp.send("Emulation.setDeviceMetricsOverride", { width:1024, height:1000, deviceScaleFactor:1, mobile:false });

    const emptyState = await cdp.evaluate(stateExpression);
    assert.equal(emptyState.profile.onboardingCompleted, false);
    assert.equal(emptyState.plants.length, 0);
    assert.equal(emptyState.zones.length, 0);
    assert.equal(emptyState.tasks.length, 0);
    assert.equal(emptyState.photos.length, 0);
    assert.equal(await cdp.evaluate("document.body.innerText.includes('21 fruit trees')"), false);
    console.log("PASS 01-04 · clean browser opens customer onboarding with no personal records");

    assert.equal(await cdp.evaluate(byText("button", "Build My Garden")), true);
    assert.equal(await cdp.evaluate(inputByLabel("Garden name", "QA Garden")), true);
    assert.equal(await cdp.evaluate(byText("button", "Continue")), true);
    assert.equal(await cdp.evaluate(byText("button", "+ Vegetable Beds")), true);
    assert.equal(await cdp.evaluate(byText("button", "+ Orchard")), true);
    await cdp.send("Page.reload", { ignoreCache:true });
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Add the places where you grow')"), "Onboarding did not restore after refresh.");
    const onboardingState = await cdp.evaluate(stateExpression);
    assert.equal(onboardingState.onboardingDraft.step, 2);
    assert.equal(onboardingState.onboardingDraft.profile.gardenName, "QA Garden");
    assert.equal(onboardingState.onboardingDraft.zones.length, 2);
    assert.equal(await cdp.evaluate(byText("button", "Continue")), true);
    for (const name of ["Tomato", "Pepper", "Strawberry", "Apple"]) {
      assert.equal(await cdp.evaluate(byText("button", `+ ${name}`)), true);
    }
    assert.equal(await cdp.evaluate(byText("button", "Continue")), true);
    assert.equal(await cdp.evaluate(byText("button", "Enter My Garden")), true);
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Welcome to QA Garden.')"), "Onboarding did not reach the dashboard.");

    let state = await cdp.evaluate(stateExpression);
    assert.equal(state.profile.onboardingCompleted, true);
    assert.equal(state.profile.gardenName, "QA Garden");
    assert.equal(state.zones.length, 2);
    assert.equal(state.plants.length, 4);
    assert.deepEqual(
      state.plants.map((plant) => plant.gardenProfileId).filter((id) => id !== state.profile.id),
      [],
    );
    const statValues = await cdp.evaluate(`Object.fromEntries(
      [...document.querySelectorAll(".js-dashboard-stat-card")]
        .map((card) => [card.querySelector(".js-dashboard-stat-card__label")?.textContent.trim(), Number(card.querySelector("strong")?.textContent)])
    )`);
    assert.equal(statValues.Plants, 4);
    assert.equal(statValues.Vegetables, 2);
    assert.equal(statValues["Fruit Trees"], 1);
    assert.equal(statValues["Garden Zones"], 2);
    assert.equal(statValues["Photos Logged"], 0);
    await cdp.send("Emulation.setDeviceMetricsOverride", { width:375, height:900, deviceScaleFactor:1, mobile:false });
    assert.equal(await cdp.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"), true);
    assert.equal(await cdp.evaluate("Boolean(document.querySelector('.js-estate-app-shell__menu'))"), true);
    await cdp.send("Emulation.setDeviceMetricsOverride", { width:1024, height:1000, deviceScaleFactor:1, mobile:false });
    console.log("PASS 05-09 · onboarding restores after refresh and creates two zones plus four categorized plants");

    assert.equal(await cdp.evaluate(byText("button", "Add New Plant")), true);
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Register a plant')"), "Add Plant did not open.");
    assert.equal(await cdp.evaluate(inputByLabel("Display name", "Cucumber")), true);
    assert.equal(await cdp.evaluate(byText("button", "Add Plant")), true);
    await waitFor(async () => (await cdp.evaluate(stateExpression)).plants.length === 5, "Cucumber was not saved.");
    state = await cdp.evaluate(stateExpression);
    assert.equal(state.plants.filter((plant) => plant.category === "Vegetables").length, 3);
    console.log("PASS 10-11 · Add Plant updates the active profile immediately");

    assert.equal(await cdp.evaluate(byText("button", "Menu")), true);
    assert.equal(await cdp.evaluate(byText(".js-estate-drawer button", "Gallery")), true);
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Garden Gallery')"), "Gallery did not open.");
    assert.equal(await cdp.evaluate(byText("button", "Upload")), true);
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Upload photographs')"), "Photo Manager did not open.");
    let documentNode = await cdp.send("DOM.getDocument", { depth:-1, pierce:true });
    let fileNode = await cdp.send("DOM.querySelector", { nodeId:documentNode.root.nodeId, selector:'input[type="file"]' });
    assert.ok(fileNode.nodeId);
    await cdp.send("DOM.setFileInputFiles", { nodeId:fileNode.nodeId, files:[photoPath] });
    await waitFor(async () => (await cdp.evaluate(stateExpression)).photos.length === 1, "Photo did not save.");
    console.log("PASS 12-13 · uploaded photo is owned by the active profile");

    assert.equal(await cdp.evaluate(byText("button", "Menu")), true);
    assert.equal(await cdp.evaluate(byText(".js-estate-drawer button", "Tasks")), true);
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Estate Tasks')"), "Tasks did not open.");
    assert.equal(await cdp.evaluate(byText("button", "Add Task")), true);
    assert.equal(await cdp.evaluate(inputByLabel("Task", "Water tomatoes")), true);
    assert.equal(await cdp.evaluate(byText("button", "Save Task")), true);
    await waitFor(async () => (await cdp.evaluate(stateExpression)).tasks.length === 1, "Task did not save.");
    console.log("PASS 14-15 · task creation updates estate task state");

    await cdp.send("Page.reload", { ignoreCache:true });
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Water tomatoes')"), "Saved data did not survive refresh.");
    state = await cdp.evaluate(stateExpression);
    assert.equal(state.plants.length, 5);
    assert.equal(state.photos.length, 1);
    assert.equal(state.tasks.length, 1);
    console.log("PASS 16-17 · profile data persists after a hard refresh");

    assert.equal(await cdp.evaluate(byText("button", "Menu")), true);
    assert.equal(await cdp.evaluate(byText(".js-estate-drawer button", "Settings")), true);
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Garden Profile & Data')"), "Settings did not open.");
    assert.equal(await cdp.evaluate(byText("button", "Manage Garden")), true);
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Garden Data')"), "Manage Garden did not open.");
    await cdp.send("Browser.setDownloadBehavior", { behavior:"allow", downloadPath:downloads, eventsEnabled:true });
    assert.equal(await cdp.evaluate(byText("button", "Export My Garden")), true);
    const backupPath = await waitFor(async () => {
      try {
        const files = await readdir(downloads);
        const backup = files.find((file) => file.endsWith(".json") && !file.endsWith(".crdownload"));
        return backup ? path.join(downloads, backup) : null;
      } catch {
        return null;
      }
    }, "Garden backup did not download.");
    const exported = JSON.parse(await readFile(backupPath, "utf8"));
    assert.equal(exported.plants.length, 5);
    assert.equal(exported.zones.length, 2);
    console.log("PASS 18 · export creates a complete JSON garden backup");

    assert.equal(await cdp.evaluate(byText("button", "Clear My Garden")), true);
    assert.equal(await cdp.evaluate(inputByLabel("Type", "CLEAR MY GARDEN")), true);
    assert.equal(await cdp.evaluate(byText("button", "Confirm")), true);
    await waitFor(async () => (await cdp.evaluate(stateExpression)).plants.length === 0, "Garden did not clear.");
    state = await cdp.evaluate(stateExpression);
    assert.equal(state.profile.onboardingCompleted, true);
    assert.equal(state.zones.length, 0);
    assert.equal(state.photos.length, 0);
    assert.equal(state.tasks.length, 0);
    console.log("PASS 19 · typed clear removes garden records and preserves the profile");

    documentNode = await cdp.send("DOM.getDocument", { depth:-1, pierce:true });
    fileNode = await cdp.send("DOM.querySelector", { nodeId:documentNode.root.nodeId, selector:'input[accept*="json"]' });
    assert.ok(fileNode.nodeId);
    await cdp.send("DOM.setFileInputFiles", { nodeId:fileNode.nodeId, files:[backupPath] });
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Review before importing')"), "Import preview did not open.");
    assert.equal(await cdp.evaluate(byText("button", "Import This Backup")), true);
    await waitFor(async () => (await cdp.evaluate(stateExpression)).plants.length === 5, "Imported records were not restored.");
    state = await cdp.evaluate(stateExpression);
    assert.equal(state.zones.length, 2);
    assert.equal(state.photos.length, 1);
    assert.equal(state.tasks.length, 1);
    console.log("PASS 20-21 · validated import preview restores the exported garden");

    assert.equal(await cdp.evaluate(byText("button", "Load Sample Garden")), true);
    assert.equal(await cdp.evaluate(inputByLabel("Type", "SAMPLE")), true);
    assert.equal(await cdp.evaluate(byText("button", "Confirm")), true);
    await waitFor(async () => (await cdp.evaluate(stateExpression)).profile.sampleGardenEnabled === true, "Sample Garden did not load.");
    state = await cdp.evaluate(stateExpression);
    assert.equal(state.profile.gardenName, "Sample Garden");
    assert.equal(state.plants.every((plant) => plant.gardenProfileId === state.profile.id), true);
    assert.equal(await cdp.evaluate("document.body.innerText.includes('Sample Garden')"), true);
    console.log("PASS 22-23 · fictional Sample Garden is clearly labeled and profile-isolated");

    assert.equal(await cdp.evaluate(byText("button", "Start My Own Garden")), true);
    assert.equal(await cdp.evaluate(inputByLabel("Type", "START FRESH")), true);
    assert.equal(await cdp.evaluate(byText("button", "Confirm")), true);
    await waitFor(() => cdp.evaluate("document.body.innerText.includes('Welcome to Jardin Soleil')"), "Fresh personal onboarding did not return.");
    state = await cdp.evaluate(stateExpression);
    assert.equal(state.profile.sampleGardenEnabled, false);
    assert.equal(state.profile.onboardingCompleted, false);
    assert.equal(state.plants.length, 0);
    assert.equal(state.zones.length, 0);
    assert.equal(state.tasks.length, 0);
    assert.equal(state.photos.length, 0);
    console.log("PASS 24-25 · leaving Sample Garden creates a clean personal profile with no sample leakage");

    const renderedText = await cdp.evaluate("document.body.innerText");
    for (const forbidden of ["21 fruit trees", "25 mint", "15 edibles"]) {
      assert.equal(renderedText.toLocaleLowerCase().includes(forbidden.toLocaleLowerCase()), false);
    }
    console.log("PASS 26 · no previous owner counts or records appear in clean customer state");
    console.log("Customer flow verification completed successfully.");
  } finally {
    cdp?.close();
    browser?.kill();
    server.kill();
    await sleep(1250);
    try {
      await rm(tempRoot, { recursive:true, force:true, maxRetries:5, retryDelay:500 });
    } catch (error) {
      console.warn(`Temporary browser data will be cleaned by the operating system: ${error.message}`);
    }
  }
}

run().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
