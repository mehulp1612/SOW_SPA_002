import Ajv2020 from 'ajv/dist/2020.js';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const schemaUrl = new URL('../schema/root-spa.schema.json', import.meta.url);
const contextUrl = new URL('../instances/demo-site/initial-context.json', import.meta.url);
const schema = JSON.parse(await readFile(schemaUrl, 'utf8'));
const contextText = await readFile(contextUrl, 'utf8');
const context = JSON.parse(contextText);

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validate = ajv.compile(schema);

if (!validate(context)) {
  console.error('Initial Context is invalid:');
  for (const error of validate.errors ?? []) {
    console.error(`- ${error.instancePath || '/'} ${error.message ?? 'is invalid'}`);
  }
  process.exitCode = 1;
} else {
  const reservedNames = new Set([
    'admin', 'api', 'auth', 'chat', 'login', 'meetings', 'settings',
  ]);
  if (reservedNames.has(context.pathName)) {
    console.error(`PathName "${context.pathName}" is reserved in the prototype.`);
    process.exitCode = 1;
  } else {
    const digest = createHash('sha256').update(contextText).digest('hex');
    console.log(`Valid Initial Context: ${context.pathName}`);
    console.log(`SHA-256: ${digest}`);
    console.log(`Source: ${fileURLToPath(contextUrl)}`);
  }
}
