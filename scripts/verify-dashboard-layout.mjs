import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const port = 4176;
const debuggingPort = 9226;
const appUrl = `http://127.0.0.1:${port}`;
const gardenStorageKey = "jardinSoleilGardenStateV2";
const styleStorageKey = "jardinSoleilGardenStyle";
const legacySkinStorageKey = "jardinSoleilDashboardSkin";
const widths = [320, 375, 390, 430, 768, 1024, 1366, 1600];
const styles = [
  "french-chalet",
  "rain-kissed-chateau",
  "twilight-wisteria",
  "jardin-classique",
  "woodland-estate",
  "heritage-farm",
  "coastal-cottage",
];
const screenshotArgumentIndex = process.argv.indexOf("--screenshots");
const screenshotDirectory = screenshotArgumentIndex >= 0 ? process.argv[screenshotArgumentIndex + 1] : undefined;
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
      // Continue through the standard browser locations.
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

const clickSkinAction = (skinName, action) => `(() => {
  const card = [...document.querySelectorAll(".js-skin-dialog__options article")]
    .find((item) => item.querySelector("strong")?.textContent.trim() === ${JSON.stringify(skinName)});
  const button = [...(card?.querySelectorAll("button") || [])]
    .find((item) => item.textContent.trim() === ${JSON.stringify(action)});
  if (!button) return false;
  button.click();
  return true;
})()`;

const geometryExpression = `(() => {
  const epsilon = 1;
  const viewportWidth = document.documentElement.clientWidth;
  const rect = (element) => {
    const value = element.getBoundingClientRect();
    return { left:value.left, right:value.right, top:value.top, bottom:value.bottom, width:value.width, height:value.height };
  };
  const overlaps = (a, b) =>
    a.left < b.right - epsilon && a.right > b.left + epsilon &&
    a.top < b.bottom - epsilon && a.bottom > b.top + epsilon;
  const groups = [
    ".js-dashboard-stats > .js-dashboard-stat-card",
    ".js-dashboard-activity-grid > .js-dashboard-panel",
    ".js-dashboard-status-grid > .js-dashboard-panel",
    ".js-dashboard-right-rail > .js-dashboard-panel",
  ];
  const overlapPairs = [];
  for (const selector of groups) {
    const items = [...document.querySelectorAll(selector)].map((element) => ({ element, rect:rect(element) }));
    for (let index = 0; index < items.length; index += 1) {
      for (let next = index + 1; next < items.length; next += 1) {
        if (overlaps(items[index].rect, items[next].rect)) overlapPairs.push(selector + ":" + index + "/" + next);
      }
    }
  }
  const visualElements = [...document.querySelectorAll(
    ".js-dashboard-canvas, .js-dashboard-stat-card, .js-dashboard-panel"
  )];
  const outOfBounds = visualElements
    .map((element) => ({ className:element.className, ...rect(element) }))
    .filter((value) => value.width <= 0 || value.height <= 0 || value.left < -epsilon || value.right > viewportWidth + epsilon);
  const canvas = document.querySelector(".js-dashboard-canvas");
  const canvasRect = rect(canvas);
  const hotspots = [...document.querySelectorAll(".js-dashboard-hotspot")];
  const invalidHotspots = hotspots.filter((hotspot) => {
    const value = rect(hotspot);
    return value.left < canvasRect.left - epsilon || value.right > canvasRect.right + epsilon ||
      value.top < canvasRect.top - epsilon || value.bottom > canvasRect.bottom + epsilon ||
      value.width <= 0 || value.height <= 0 ||
      getComputedStyle(hotspot).pointerEvents === "none" || hotspot.disabled;
  }).length;
  const image = document.querySelector(".js-dashboard-canvas__art img");
  return {
    scrollWidth:document.documentElement.scrollWidth,
    viewportWidth,
    overlapPairs,
    outOfBounds,
    hotspotCount:hotspots.length,
    invalidHotspots,
    currentSrc:image?.currentSrc || "",
    imageReady:Boolean(image?.complete && image?.naturalWidth > 0),
    inlinePicker:Boolean(document.querySelector(".js-dashboard-skin-picker")),
    skin:document.querySelector(".js-dashboard")?.dataset.dashboardSkin,
  };
})()`;

async function setViewport(cdp, width) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height:width <= 430 ? 900 : width <= 768 ? 1024 : 1100,
    deviceScaleFactor:1,
    mobile:false,
  });
  await sleep(180);
}

async function reloadWithSkin(cdp, skin) {
  await cdp.evaluate(`localStorage.setItem(${JSON.stringify(styleStorageKey)}, ${JSON.stringify(skin)})`);
  await cdp.send("Page.reload", { ignoreCache:true });
  await waitFor(
    () => cdp.evaluate(`document.querySelector(".js-dashboard")?.dataset.dashboardSkin === ${JSON.stringify(skin)}`),
    `Dashboard did not load skin ${skin}.`,
  );
}

async function openSkinDialog(cdp) {
  assert.equal(await cdp.evaluate(clickByText("button", "Menu")), true);
  await waitFor(() => cdp.evaluate("Boolean(document.querySelector('.js-estate-drawer'))"), "Menu did not open.");
  assert.equal(await cdp.evaluate(clickByText(".js-estate-drawer button", "Appearance")), true);
  await waitFor(
    () => cdp.evaluate("Boolean(document.querySelector('#estate-appearance-submenu'))"),
    "Appearance submenu did not open.",
  );
  assert.equal(await cdp.evaluate(clickByText("#estate-appearance-submenu button", "Garden Styles")), true);
  await waitFor(() => cdp.evaluate("Boolean(document.querySelector('.js-skin-dialog'))"), "Garden Styles dialog did not open.");
}

async function run() {
  const browserPath = await findBrowser();
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "jardin-dashboard-qa-"));
  const browserProfile = path.join(tempRoot, "browser");
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
    await waitFor(async () => (await fetch(appUrl)).ok, `Preview server did not start. ${serverOutput}`);
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
      "--window-size=1366,1100",
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
      const state = JSON.parse(localStorage.getItem(${JSON.stringify(gardenStorageKey)}));
      state.profile = { ...state.profile, gardenName:"Layout QA Garden", onboardingCompleted:true };
      localStorage.setItem(${JSON.stringify(gardenStorageKey)}, JSON.stringify(state));
      localStorage.setItem("jardinSoleilHealthPage", "Dashboard");
    })()`);
    await cdp.send("Page.reload", { ignoreCache:true });
    await waitFor(() => cdp.evaluate("Boolean(document.querySelector('.js-dashboard'))"), "Dashboard did not open.");

    for (const style of styles) {
      await reloadWithSkin(cdp, style);
      for (const width of widths) {
        await setViewport(cdp, width);
        await waitFor(
          () => cdp.evaluate("document.querySelector('.js-dashboard-canvas__art img')?.complete"),
          `Artwork did not finish at ${width}px.`,
        );
        const result = await cdp.evaluate(geometryExpression);
        assert.equal(result.skin, style, `${style} did not remain selected at ${width}px.`);
        assert.equal(result.imageReady, true, `${style} image failed at ${width}px.`);
        assert.equal(result.inlinePicker, false, "A permanent skin picker is still in dashboard flow.");
        assert.equal(result.scrollWidth <= result.viewportWidth + 1, true, `Horizontal overflow at ${width}px.`);
        assert.deepEqual(result.overlapPairs, [], `Dashboard cards overlap at ${width}px.`);
        assert.deepEqual(result.outOfBounds, [], `Dashboard content leaves viewport at ${width}px.`);
        assert.equal(result.hotspotCount, 6, `Hotspot count changed at ${width}px.`);
        assert.equal(result.invalidHotspots, 0, `A hotspot is clipped or blocked at ${width}px.`);
        assert.equal(result.currentSrc.includes("mobile"), width <= 700, `Wrong artwork variant at ${width}px.`);
      }
    }
    console.log("PASS artwork, grids, overflow, and hotspots at 56 style/width combinations");

    await setViewport(cdp, 1024);
    await reloadWithSkin(cdp, "french-chalet");
    await openSkinDialog(cdp);
    assert.equal(
      await cdp.evaluate("document.activeElement?.getAttribute('aria-label') === 'Close Garden Styles'"),
      true,
      "Dialog did not receive focus.",
    );
    assert.equal(await cdp.evaluate(clickSkinAction("Heritage Farm", "Preview")), true);
    await waitFor(
      () => cdp.evaluate("document.querySelector('.js-dashboard')?.dataset.gardenStyle === 'heritage-farm'"),
      "Preview did not update dashboard artwork.",
    );
    assert.equal(await cdp.evaluate(`localStorage.getItem(${JSON.stringify(styleStorageKey)})`), "french-chalet");
    assert.equal(await cdp.evaluate(clickByText(".js-skin-dialog footer button", "Cancel")), true);
    await waitFor(() => cdp.evaluate("!document.querySelector('.js-skin-dialog')"), "Cancel did not close dialog.");
    assert.equal(await cdp.evaluate("document.querySelector('.js-dashboard')?.dataset.gardenStyle"), "french-chalet");

    await openSkinDialog(cdp);
    assert.equal(await cdp.evaluate(clickSkinAction("Woodland Estate", "Preview")), true);
    assert.equal(await cdp.evaluate(clickByText(".js-skin-dialog footer button", "Apply Style: Woodland Estate")), true);
    await waitFor(() => cdp.evaluate("!document.querySelector('.js-skin-dialog')"), "Apply did not close dialog.");
    assert.equal(await cdp.evaluate(`localStorage.getItem(${JSON.stringify(styleStorageKey)})`), "woodland-estate");
    await cdp.send("Page.reload", { ignoreCache:true });
    await waitFor(
      () => cdp.evaluate("document.querySelector('.js-dashboard')?.dataset.gardenStyle === 'woodland-estate'"),
      "Applied style did not persist after refresh.",
    );

    await setViewport(cdp, 320);
    await openSkinDialog(cdp);
    const mobileDialog = await cdp.evaluate(`(() => {
      const dialog = document.querySelector(".js-skin-dialog");
      const rect = dialog.getBoundingClientRect();
      return {
        left:rect.left,
        right:rect.right,
        viewport:document.documentElement.clientWidth,
        bodyLocked:document.body.style.overflow === "hidden",
        canScroll:dialog.scrollHeight >= dialog.clientHeight,
      };
    })()`);
    assert.equal(mobileDialog.left >= 0 && mobileDialog.right <= mobileDialog.viewport + 1, true);
    assert.equal(mobileDialog.bodyLocked, true);
    assert.equal(mobileDialog.canScroll, true);
    await cdp.send("Input.dispatchKeyEvent", { type:"keyDown", key:"Escape", code:"Escape" });
    await cdp.send("Input.dispatchKeyEvent", { type:"keyUp", key:"Escape", code:"Escape" });
    await waitFor(() => cdp.evaluate("!document.querySelector('.js-skin-dialog')"), "Escape did not close dialog.");
    assert.equal(await cdp.evaluate("document.querySelector('.js-dashboard')?.dataset.gardenStyle"), "woodland-estate");

    await openSkinDialog(cdp);
    await cdp.evaluate(`document.querySelector(".js-skin-dialog__backdrop")
      .dispatchEvent(new MouseEvent("mousedown", { bubbles:true }))`);
    await waitFor(() => cdp.evaluate("!document.querySelector('.js-skin-dialog')"), "Backdrop did not close dialog.");
    await cdp.evaluate(`(() => {
      localStorage.removeItem(${JSON.stringify(styleStorageKey)});
      localStorage.setItem(${JSON.stringify(legacySkinStorageKey)}, "rain-kissed-chateau");
    })()`);
    await cdp.send("Page.reload", { ignoreCache:true });
    await waitFor(
      () => cdp.evaluate("document.querySelector('.js-dashboard')?.dataset.gardenStyle === 'rain-kissed-chateau'"),
      "The legacy Dashboard Skin preference did not migrate.",
    );
    await waitFor(
      () => cdp.evaluate(`localStorage.getItem(${JSON.stringify(styleStorageKey)}) === "rain-kissed-chateau"`),
      "The migrated Garden Styles preference was not saved.",
    );
    assert.equal(await cdp.evaluate(`localStorage.getItem(${JSON.stringify(legacySkinStorageKey)})`), "rain-kissed-chateau");
    console.log("PASS Menu > Appearance > Garden Styles preview, cancel, apply, persistence, migration, focus, Escape, and backdrop behavior");

    if (screenshotDirectory) {
      await mkdir(screenshotDirectory, { recursive:true });
      for (const width of [390, 1366]) {
        await setViewport(cdp, width);
        await cdp.evaluate("window.scrollTo(0, 0)");
        const capture = await cdp.send("Page.captureScreenshot", { format:"png", captureBeyondViewport:false });
        await writeFile(path.join(screenshotDirectory, `dashboard-${width}.png`), Buffer.from(capture.data, "base64"));
      }
      console.log(`QA screenshots: ${screenshotDirectory}`);
    }
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
