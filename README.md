# Root SPA Prototype

A React + TypeScript + Vite starter for the SAFI Root SPA concept. This workspace is a prototype; it is not connected to SafiChat, Cognito, SAFI Git, EFS, or a SAFI publishing service.

## Prerequisites

- Node.js 22.12 or newer (this machine has Node 22.16.0).
- npm.
- The user's GitHub repository and permission to push, when ready to connect it.
- GitHub Pages and Actions enabled for the repository before preview publication.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local Vite URL printed in the terminal. Edit the configuration in the left panel; the right panel updates live. Changes currently exist only in browser memory and are discarded on refresh.

## Initial Context

- Contract: `schema/root-spa.schema.json` (JSON Schema Draft 2020-12).
- Starter content: `instances/demo-site/initial-context.json`.
- Validation: `npm.cmd run validate:context`.
- The validator checks schema and a small temporary reserved-path list. SAFI's actual reserved routes are not known yet.
- `package-lock.json` should be committed before the first real preview deployment. Dependency installation could not reach the npm registry in this environment, so the current workflow uses `npm install` until a lockfile can be generated. Switch it to `npm ci` once the lockfile is committed.

## Build

```powershell
npm.cmd run build
npm.cmd run preview
```

The build validates the sample context, runs TypeScript's project build, and bundles the static site. No tests are included at this setup stage.

## GitHub Pages preview

The workflow at `.github/workflows/pages.yml` validates and builds committed code and publishes `dist/` to GitHub Pages. For project sites it derives Vite's base path from `GITHUB_REPOSITORY`. It also copies the built entry document to `404.html` to support a client-side route fallback; direct navigation and refresh must be checked after the repository is connected.

Before first publication, connect this workspace to the user's GitHub repo, enable Pages with GitHub Actions as the source, and allow the workflow's Pages deployment permissions. The resulting Pages URL is a preview and is not the final SafiChat URL or EFS deployment.

## Important prototype boundary

The editor does not authenticate users, commit edits to GitHub, or publish from the browser. Never add a GitHub token or other privileged secret to frontend code. For the SOW deliverable, SAFI must supply its SafiChat integration, Cognito Publisher authorization, trusted commit/publish path, EFS, reverse proxy route, and reserved path list.
