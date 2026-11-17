# Root SPA Prototype

A React + TypeScript + Vite builder and static landing-page publisher for the SAFI Root SPA concept. The GitHub Pages version is a prototype; it is not connected to SafiChat, Cognito, SAFI Git, EFS, or a SAFI publishing service.

## Prerequisites

- Node.js 22.12 or newer and npm.
- GitHub Pages enabled with GitHub Actions as the publishing source.

## Run locally

```powershell
npm.cmd ci
npm.cmd run dev
```

Open the Vite URL printed in the terminal. The builder is at the root URL. Its preview updates while you edit, but those draft edits stay in browser memory until you download and add the configuration to Git.

## Site configuration

- Contract: `schema/root-spa.schema.json` (JSON Schema Draft 2020-12).
- Example site: `instances/demo-site/initial-context.json`.
- Each published site belongs in `instances/<PathName>/initial-context.json`; the directory name must match the configuration's `pathName`.
- Run `npm.cmd run validate:context` to validate every site configuration, reserved path, and duplicate path name.

## Publish a page through GitHub Pages

1. Edit and preview the page in the builder.
2. Click **Download validated configuration**.
3. For a new page, create `instances/<PathName>/` and place the downloaded file there as `initial-context.json`. For an update, replace the existing file for that same `PathName`.
4. Review and commit the configuration, then push to `main`.
5. GitHub Actions validates all configs, builds the SPA, and deploys the builder and published pages together. The visitor page appears at `<Pages URL>/<PathName>/`.

The browser never writes a GitHub token or commits directly. Updates to a page use the same URL. Reverting the configuration commit and pushing it republishes the prior content. `dist/release.json` records the source commit and a SHA-256 digest for every published context.

The workflow copies `index.html` to `404.html` for the GitHub Pages client-side route fallback. The published site and its route must be checked after enabling Pages and deploying. If the repository is a project site, its Pages base URL includes the repository path.

## Build

```powershell
npm.cmd run validate:context
npm.cmd run build
npm.cmd run preview
```

## Prototype boundary

This prototype has no Cognito authorization or authenticated in-app Git write service. Anyone who can push configuration to the repository can publish the public static site. Do not place secrets, executable code, IAM policy, or arbitrary routes in Initial Context. The final SOW still requires native SafiChat integration, Publisher authorization, SAFI Git, a trusted SAFI publisher, EFS, and the existing SafiChat route.
