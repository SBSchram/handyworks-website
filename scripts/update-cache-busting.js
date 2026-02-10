#!/usr/bin/env node
/**
 * Single source of truth for cache busting: js/config.js
 * Run this script after changing HandyWorksConfig.version in js/config.js
 * to inject that version into all HTML files (replaces ?v=... in link and script URLs).
 *
 * Usage: node scripts/update-cache-busting.js
 * Or:    npm run update-cache
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'js', 'config.js');

function getVersionFromConfig() {
  const content = fs.readFileSync(CONFIG_PATH, 'utf8');
  const m = content.match(/version:\s*['"]([^'"]+)['"]/);
  if (!m) throw new Error('Could not find version in js/config.js');
  return m[1];
}

function findHtmlFiles(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules' && e.name !== '.git') findHtmlFiles(full, list);
    } else if (e.name.endsWith('.html')) {
      list.push(full);
    }
  }
  return list;
}

function updateHtmlFile(filePath, version) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace any ?v=... in href or src with ?v=${version}
  const pattern = /\?v=[^"'\s>]+/g;
  const newContent = content.replace(pattern, `?v=${version}`);
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  }
  return false;
}

const version = getVersionFromConfig();
const htmlFiles = findHtmlFiles(ROOT);
let updated = 0;
for (const f of htmlFiles) {
  if (updateHtmlFile(f, version)) updated++;
}
console.log(`Cache busting set to v=${version} (updated ${updated} of ${htmlFiles.length} HTML files).`);
