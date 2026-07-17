import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const manifestPath = path.join(projectRoot, 'design-system/learning-diagrams.json');
export const mermaidConfigPath = path.join(projectRoot, 'design-system/mermaid-config.json');
export const mermaidCssPath = path.join(projectRoot, 'design-system/mermaid-theme.css');
export const packagePath = path.join(projectRoot, 'package.json');
export const mmdcPath = path.join(projectRoot, 'node_modules/.bin', process.platform === 'win32' ? 'mmdc.cmd' : 'mmdc');
export const fingerprintLabel = 'blueprint-mermaid-input-sha256';

export function readManifest() {
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

export function collectFiles(directory, suffix) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(target, suffix));
    else if (entry.isFile() && entry.name.endsWith(suffix)) files.push(target);
  }
  return files.sort();
}

export function relativeFromRoot(target) {
  return path.relative(projectRoot, target).split(path.sep).join('/');
}

export function diagramFingerprint(sourcePath) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const cliVersion = packageJson.devDependencies?.['@mermaid-js/mermaid-cli'];
  const input = [
    `source\0${fs.readFileSync(sourcePath, 'utf8')}`,
    `config\0${fs.readFileSync(mermaidConfigPath, 'utf8')}`,
    `css\0${fs.readFileSync(mermaidCssPath, 'utf8')}`,
    `cli\0${cliVersion}`,
  ].join('\0');
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function mermaidArgs(sourcePath, outputPath) {
  return [
    '--input', sourcePath,
    '--output', outputPath,
    '--configFile', mermaidConfigPath,
    '--cssFile', mermaidCssPath,
    '--backgroundColor', 'transparent',
    '--quiet',
  ];
}

export function mermaidEnvironment() {
  const environment = { ...process.env };
  const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (!environment.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(macChrome)) {
    environment.PUPPETEER_EXECUTABLE_PATH = macChrome;
  }
  return environment;
}
