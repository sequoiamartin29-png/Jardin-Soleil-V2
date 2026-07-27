import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const packageJson = JSON.parse(read("package.json"));
const capacitor = JSON.parse(read("capacitor.config.json"));
const manifest = JSON.parse(read("public/manifest.webmanifest"));
const html = read("index.html");
const privacy = read("public/privacy.html");

assert.equal(capacitor.appName, "Jardin Soleil");
assert.equal(capacitor.webDir, "dist");
assert.match(capacitor.appId, /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*){2,}$/i);
assert.equal(packageJson.dependencies["@capacitor/core"], packageJson.dependencies["@capacitor/android"]);
assert.equal(packageJson.dependencies["@capacitor/core"], packageJson.dependencies["@capacitor/ios"]);
assert.equal(manifest.name, "Jardin Soleil");
assert.match(html, /viewport-fit=cover/);
assert.match(html, /manifest\.webmanifest/);
assert.match(privacy, /Privacy Policy/);
assert.ok(existsSync(new URL("../public/icons/jardin-soleil-512.png", import.meta.url)));
assert.ok(existsSync(new URL("../resources/icon.png", import.meta.url)));

console.log("Store-readiness verification passed.");
