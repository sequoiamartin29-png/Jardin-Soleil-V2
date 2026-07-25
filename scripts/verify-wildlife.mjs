import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const port = 4177;
const debuggingPort = 9227;
const appUrl = `http://127.0.0.1:${port}`;
const gardenStorageKey = "jardinSoleilGardenStateV2";
const environmentStorageKey = "jardinSoleilEnvironmentSettings";
const browserCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
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
  for (const candidate of browserCandidates) {
    try {
      await readFile(candidate);
      return candidate;
    } catch {
      // Continue through standard browser locations.
    }
  }
  throw new Error("Chrome or Edge was not found.");
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

const clickByText = (selector, text) => `(() => {
  const target = ${JSON.stringify(text)};
  const element = [...document.querySelectorAll(${JSON.stringify(selector)})]
    .find((item) => item.textContent.replace(/\\s+/g, " ").trim().includes(target));
  if (!element) return false;
  element.click();
  return true;
})()`;

const setEnvironmentExpression = (overrides) => `(() => {
  const key = ${JSON.stringify(environmentStorageKey)};
  const current = JSON.parse(localStorage.getItem(key) || "{}");
  localStorage.setItem(key, JSON.stringify({
    ...current,
    liveWeather:false,
    seasonalEffects:true,
    dayNight:true,
    wildlife:true,
    wildlifeActivity:"Natural",
    quality:"Full",
    reducedMotion:false,
    previewCondition:"clear",
    previewSeason:"summer",
    ...${JSON.stringify(overrides)}
  }));
})()`;

async function setViewport(cdp, width) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height:width <= 430 ? 900 : 1050,
    deviceScaleFactor:1,
    mobile:false,
  });
  await sleep(250);
}

async function reloadDashboard(cdp) {
  await cdp.send("Page.reload", { ignoreCache:true });
  await waitFor(() => cdp.evaluate("Boolean(document.querySelector('.js-dashboard'))"), "Dashboard did not load.");
}

async function openAppearance(cdp) {
  assert.equal(await cdp.evaluate(clickByText("button", "Menu")), true);
  await waitFor(() => cdp.evaluate("Boolean(document.querySelector('.js-estate-drawer'))"), "Menu did not open.");
  if (!await cdp.evaluate("Boolean(document.querySelector('#estate-appearance-submenu'))")) {
    assert.equal(await cdp.evaluate(clickByText(".js-estate-drawer button", "Appearance")), true);
    await waitFor(
      () => cdp.evaluate("Boolean(document.querySelector('#estate-appearance-submenu'))"),
      "Appearance submenu did not open.",
    );
  }
  assert.equal(await cdp.evaluate(clickByText("#estate-appearance-submenu button", "Dashboard Skins")), true);
  await waitFor(() => cdp.evaluate("Boolean(document.querySelector('.js-skin-dialog'))"), "Appearance dialog did not open.");
}

async function run() {
  const browserPath = await findBrowser();
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "jardin-wildlife-qa-"));
  const browserProfile = path.join(tempRoot, "browser");
  const server = spawn(
    process.execPath,
    [path.join(projectRoot, "node_modules", "vite", "bin", "vite.js"), "--host", "127.0.0.1", "--port", String(port)],
    { cwd:projectRoot, windowsHide:true, stdio:["ignore", "pipe", "pipe"] },
  );
  let serverOutput = "";
  server.stdout.on("data", (chunk) => { serverOutput += chunk; });
  server.stderr.on("data", (chunk) => { serverOutput += chunk; });
  let browser;
  let cdp;

  try {
    await waitFor(async () => (await fetch(appUrl)).ok, `Development server did not start. ${serverOutput}`);
    browser = spawn(browserPath, [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-breakpad",
      "--disable-crash-reporter",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${debuggingPort}`,
      `--user-data-dir=${browserProfile}`,
      "--window-size=1024,1050",
      "about:blank",
    ], { windowsHide:true, stdio:"ignore" });

    const target = await waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${debuggingPort}/json/new?${encodeURIComponent(appUrl)}`, { method:"PUT" });
      return response.ok ? response.json() : null;
    }, "Browser debugging endpoint did not start.");
    cdp = new Cdp(target.webSocketDebuggerUrl);
    await cdp.connect();
    await waitFor(() => cdp.evaluate(`Boolean(localStorage.getItem(${JSON.stringify(gardenStorageKey)}))`), "Garden state did not initialize.");
    await cdp.evaluate(`(() => {
      const key = ${JSON.stringify(gardenStorageKey)};
      const state = JSON.parse(localStorage.getItem(key));
      state.profile = { ...state.profile, gardenName:"Wildlife QA Garden", onboardingCompleted:true };
      localStorage.setItem(key, JSON.stringify(state));
      localStorage.setItem("jardinSoleilHealthPage", "Dashboard");
    })()`);
    await reloadDashboard(cdp);
    assert.equal(
      await cdp.evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(environmentStorageKey)})).wildlifeActivity`),
      "Off",
    );
    assert.equal(await cdp.evaluate("Boolean(document.querySelector('.js-estate-wildlife'))"), false);
    assert.equal(await cdp.evaluate("Boolean(document.querySelector('.js-buddy-layer, .js-buddy-positioner, .js-buddy-bubble'))"), false);
    console.log("PASS customer dashboard defaults to wildlife Off and mounts no Buddy layer");

    await cdp.evaluate(setEnvironmentExpression({}));
    await reloadDashboard(cdp);

    assert.equal(await cdp.evaluate("document.querySelectorAll('[class*=\"fountain-motion\"], [class*=\"js-fountain\"]').length"), 0);
    assert.equal(await cdp.evaluate("document.querySelector('.js-dashboard-canvas__art img')?.naturalWidth > 0"), true);
    assert.equal(await cdp.evaluate("document.querySelector('.js-estate-wildlife')?.getAttribute('aria-hidden')"), "true");
    assert.equal(await cdp.evaluate("getComputedStyle(document.querySelector('.js-estate-wildlife')).pointerEvents"), "none");
    console.log("PASS fountain animation DOM is absent while the estate artwork remains loaded");

    await waitFor(
      () => cdp.evaluate("Boolean(document.querySelector('.js-wildlife-event'))"),
      "Natural clear-weather wildlife did not schedule.",
      7000,
    );
    const naturalEvent = await cdp.evaluate(`(() => {
      const event = document.querySelector(".js-wildlife-event");
      const image = event?.querySelector("img");
      const animation = event ? getComputedStyle(event).animationName : "";
      return {
        count:document.querySelectorAll(".js-wildlife-event").length,
        text:event?.textContent || "",
        imageReady:Boolean(image?.complete && image?.naturalWidth > 0),
        source:image?.currentSrc || "",
        animation,
        pointerEvents:event ? getComputedStyle(event).pointerEvents : "",
      };
    })()`);
    assert.equal(naturalEvent.count <= 2, true);
    assert.equal(naturalEvent.text, "");
    assert.equal(naturalEvent.imageReady, true);
    assert.match(naturalEvent.source, /estate-(swallow|butterfly|bee)/);
    assert.match(naturalEvent.animation, /wildlife-/);
    assert.equal(naturalEvent.pointerEvents, "none");

    await setViewport(cdp, 390);
    await waitFor(
      () => cdp.evaluate("Boolean(document.querySelector('.js-wildlife-event'))"),
      "Mobile wildlife did not schedule.",
      7000,
    );
    assert.equal(await cdp.evaluate("document.querySelectorAll('.js-wildlife-event').length <= 1"), true);
    console.log("PASS natural assets animate on preset paths with desktop/mobile concurrency caps");

    const ruleResults = await cdp.evaluate(`(async () => {
      const module = await import("/src/data/estateWildlife.js");
      const find = (id) => module.estateWildlife.find((item) => item.id === id);
      const eligible = (id, context) => module.isWildlifeEligible(find(id), context);
      return {
        butterflyRain:eligible("painted-lady", { condition:"rain", phase:"daytime", season:"summer", windy:false }),
        beeWind:eligible("garden-bumblebee", { condition:"clear", phase:"daytime", season:"summer", windy:true }),
        butterflyNight:eligible("painted-lady", { condition:"clear", phase:"night", season:"summer", windy:false }),
        mothNight:eligible("hawk-moth", { condition:"clear", phase:"night", season:"summer", windy:false }),
        butterflyWinter:eligible("painted-lady", { condition:"clear", phase:"daytime", season:"winter", windy:false }),
        winterBird:eligible("barn-swallow", { condition:"snow", phase:"daytime", season:"winter", windy:false }),
      };
    })()`);
    assert.deepEqual(ruleResults, {
      butterflyRain:false,
      beeWind:false,
      butterflyNight:false,
      mothNight:true,
      butterflyWinter:false,
      winterBird:false,
    });
    console.log("PASS rain, wind, night, and winter eligibility rules");

    await cdp.evaluate(setEnvironmentExpression({ previewCondition:"rain" }));
    await reloadDashboard(cdp);
    await sleep(4000);
    assert.equal(await cdp.evaluate("document.querySelectorAll('.js-wildlife-event').length"), 0);

    await cdp.evaluate(setEnvironmentExpression({ previewCondition:"clear", previewSeason:"winter" }));
    await reloadDashboard(cdp);
    await sleep(4500);
    assert.equal(await cdp.evaluate("document.querySelectorAll('.js-wildlife-event').length"), 0);

    await cdp.evaluate(setEnvironmentExpression({ previewCondition:"clear", previewSeason:"summer", reducedMotion:true }));
    await reloadDashboard(cdp);
    await sleep(3500);
    assert.equal(await cdp.evaluate("Boolean(document.querySelector('.js-estate-wildlife'))"), false);
    console.log("PASS rain suppresses wildlife, winter is sparse, and reduced motion mounts no flight layer");

    await cdp.evaluate(setEnvironmentExpression({ previewCondition:"clear", previewSeason:"summer" }));
    await reloadDashboard(cdp);
    await setViewport(cdp, 1024);
    await openAppearance(cdp);
    assert.equal(await cdp.evaluate("Boolean(document.querySelector('.js-skin-dialog__wildlife select'))"), true);
    await cdp.evaluate(`(() => {
      const select = document.querySelector(".js-skin-dialog__wildlife select");
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(select, "Off");
      select.dispatchEvent(new Event("change", { bubbles:true }));
    })()`);
    await waitFor(
      () => cdp.evaluate("!document.querySelector('.js-estate-wildlife')"),
      "Wildlife Off did not remove the layer.",
    );
    await waitFor(
      () => cdp.evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(environmentStorageKey)})).wildlifeActivity === "Off"`),
      "Wildlife setting did not persist.",
    );
    console.log("PASS Appearance exposes persistent Natural, Minimal, and Off wildlife activity");
  } finally {
    cdp?.close();
    if (browser && !browser.killed) {
      const exited = new Promise((resolve) => browser.once("exit", resolve));
      browser.kill();
      await Promise.race([exited, sleep(3000)]);
    }
    server.kill();
    await rm(tempRoot, { recursive:true, force:true, maxRetries:5, retryDelay:250 });
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
