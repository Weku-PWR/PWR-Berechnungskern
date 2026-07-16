'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const ignoredDirectories = new Set(['.git', 'dist', 'node_modules']);

function findJavaScriptFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...findJavaScriptFiles(fullPath));
    if (entry.isFile() && entry.name.endsWith('.js')) files.push(fullPath);
  }
  return files;
}

const files = findJavaScriptFiles(projectRoot).sort();
let failed = false;

for (const file of files) {
  const relativePath = path.relative(projectRoot, file);
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed = true;
    console.error(`Syntaxfehler in ${relativePath}`);
    if (result.stderr) process.stderr.write(result.stderr);
  }
}

if (failed) process.exitCode = 1;
else console.log(`Syntaxprüfung erfolgreich (${files.length} JavaScript-Dateien).`);
