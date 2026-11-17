import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const instancesUrl = new URL('../instances/', import.meta.url);
const outputUrl = new URL('../dist/release.json', import.meta.url);
const directories = (await readdir(instancesUrl, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const sites = [];
for (const pathName of directories) {
  const configPath = new URL(`${pathName}/initial-context.json`, instancesUrl);
  const config = await readFile(configPath, 'utf8');
  sites.push({
    pathName,
    contextSha256: createHash('sha256').update(config).digest('hex'),
  });
}

const manifest = {
  commit: process.env.GITHUB_SHA ?? 'local',
  sites,
};

await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await writeFile(outputUrl, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Release manifest written: ${fileURLToPath(outputUrl)}`);
