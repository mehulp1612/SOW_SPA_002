import Ajv2020 from 'ajv/dist/2020.js';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const schemaUrl = new URL('../schema/root-spa.schema.json', import.meta.url);
const instancesUrl = new URL('../instances/', import.meta.url);
const instancesPath = fileURLToPath(instancesUrl);
const schema = JSON.parse(await readFile(schemaUrl, 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validate = ajv.compile(schema);
const reservedNames = new Set([
  'admin', 'api', 'auth', 'chat', 'login', 'meetings', 'settings',
]);
const directories = await readdir(instancesUrl, { withFileTypes: true });
const instanceDirectories = directories.filter((entry) => entry.isDirectory());
const pathNames = new Set();
let hasErrors = false;

if (instanceDirectories.length === 0) {
  console.error('No site configurations found under instances/.');
  process.exitCode = 1;
}

for (const directory of instanceDirectories) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(directory.name)) {
    console.error(`Invalid instance directory name "${directory.name}".`);
    hasErrors = true;
    continue;
  }

  if (reservedNames.has(directory.name)) {
    console.error(`Instance directory "${directory.name}" uses a reserved path.`);
    hasErrors = true;
    continue;
  }

  const configPath = join(instancesPath, directory.name, 'initial-context.json');
  const configDisplayPath = `instances/${directory.name}/initial-context.json`;
  let context;
  let contextText;

  try {
    contextText = await readFile(configPath, 'utf8');
    context = JSON.parse(contextText);
  } catch (error) {
    console.error(`Invalid JSON at ${configDisplayPath}: ${error.message}`);
    hasErrors = true;
    continue;
  }

  if (!validate(context)) {
    console.error(`Invalid Initial Context at ${configDisplayPath}:`);
    for (const error of validate.errors ?? []) {
      console.error(`- ${error.instancePath || '/'} ${error.message ?? 'is invalid'}`);
    }
    hasErrors = true;
    continue;
  }

  let currentContextValid = true;
  if (directory.name !== context.pathName) {
    console.error(`Directory "${directory.name}" must match pathName "${context.pathName}".`);
    hasErrors = true;
    currentContextValid = false;
  }
  if (reservedNames.has(context.pathName)) {
    console.error(`PathName "${context.pathName}" is reserved in the prototype.`);
    hasErrors = true;
    currentContextValid = false;
  }
  if (pathNames.has(context.pathName)) {
    console.error(`Duplicate PathName "${context.pathName}".`);
    hasErrors = true;
    currentContextValid = false;
  }

  pathNames.add(context.pathName);
  if (currentContextValid) {
    console.log(`Valid Initial Context: ${context.pathName} (${configDisplayPath})`);
  }
}

if (hasErrors) process.exitCode = 1;
