# Root SPA Prototype: Scope and Architecture

**Status:** Builder and Git-based static page publication are implemented locally; GitHub Pages deployment and SAFI integration remain pending.
**Source:** `SAFI_TACT_SPA_001_Root_SPA_Dyad_Git_EFS_2026-11-16.docx`  
**Prototype target:** This machine, the user's GitHub repository, GitHub Actions, and GitHub Pages.

## 1. What the SOW asks us to build

The SOW asks for one real, attractive, responsive landing page published as a subordinate page of the existing SafiChat site. An authorized SafiChat user should be able to choose a safe unique `PathName`, edit a constrained Initial Context in native SafiChat, preview it, publish it, update the same URL, and roll back to an earlier qualified release.

The prescribed product boundaries are:

- React + TypeScript + Vite for one reusable Root SPA.
- A manually authored, versioned Initial Context JSON document validated by Ajv against JSON Schema Draft 2020-12.
- SAFI Git as source/configuration authority.
- Validated static builds published to SAFI EFS under versioned release paths.
- Existing SafiChat, Cognito, and JetStream remain authoritative and continue to work. The SPA is subordinate; it does not replace Chat, login, meetings, or history.
- Dyad customizes the visual design in the Git project. Deployment must use a committed source revision, not an uncommitted local Dyad folder.

Required acceptance includes the working SafiChat URL and route, editing and previewing inside native SafiChat, authorized publication, Git SHA/config digest evidence, validation of malformed or unsafe input, desktop/mobile behavior, stable-URL update and rollback, and confirmation that existing Chat behavior remains intact.

## 2. Prototype substitutions and reasons

The prototype is intended to make the SPA, schema, design/edit/preview flow, and automated build visible before SAFI infrastructure is available. These are explicit stand-ins, not claims of SOW compliance.

| SOW component | Prototype choice | Reason and boundary |
|---|---|---|
| SAFI Git repository | User's own GitHub repository | Enables version control and review now. Later, transfer or adapt the work to the SAFI-controlled repository and its branch rules. |
| SAFI developer machine | This machine | Dyad and local development will run here. |
| EFS | GitHub Pages static deployment | Hosts the builder at the Pages root and committed landing pages at `/<PathName>/`. Pages is static hosting, not EFS or a SAFI deployment target. |
| Trusted SAFI runner | GitHub Actions | Can validate and build committed revisions and publish the preview. It cannot write to this machine's disk from a hosted runner. |
| SafiChat shell and route | Placeholder route/configuration | SafiChat source, URL, and reserved routes are unavailable. Preview routing will be tested on the Pages URL and must be adapted to SAFI's actual host/path later. |
| Cognito and Publisher role | Omitted in the prototype | Cognito is unavailable and explicitly skipped for now. No production identity or authorization claim can be made. Any development-only editor access is a demo convenience, not a security boundary. |
| User-config-to-Git commit | Download validated JSON; user manually reviews and commits it | The static browser app cannot safely hold a GitHub credential. The eventual in-app action requires a secure authenticated service or SAFI-controlled runner. |

GitHub Pages supports static site publication and custom 404 pages; client-side deep-link behavior still needs an explicit fallback and deployed verification. The Pages preview URL may include the repository name and will not be the final SafiChat `/<PathName>` URL. See [GitHub Pages](https://pages.github.com/) and [GitHub Pages 404 guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites).

## 3. Prototype scope

The prototype now includes:

1. A responsive, visually polished Root SPA built with React, TypeScript, and Vite.
2. A constrained Initial Context schema and example instance, with Ajv validation and safe rendering of content.
3. A simple Edit/Preview experience operating on a constrained config. The editor downloads the validated JSON; the user reviews and commits it under `instances/<PathName>/initial-context.json` to publish. It does not imply Cognito authorization or write GitHub credentials into the browser.
4. A committed-source GitHub Actions workflow that validates every instance config, builds the builder and published-page routes, and deploys them together to GitHub Pages.
5. Release metadata/evidence identifying the source commit and every published config digest. Prototype rollback means reverting the config commit and allowing Pages to redeploy; it is not the SOW's EFS release-pointer rollback.
6. An operator/developer README with local run, build, preview publication, and rollback instructions.

The prototype does not include a SafiChat backend, Cognito, JetStream changes, a privileged GitHub-writing service, EFS, or a claim of production authorization. Draft edits remain in browser memory; publishing exports validated JSON for a deliberate repository change. A true in-app publish action still requires a secure authenticated write path.

## 4. Architecture

```text
Dyad on this machine
        │ edit source; builder drafts a configuration
        ▼
User's GitHub repository (source and committed instances/*/initial-context.json)
        │ reviewed config/source commit pushed to main
        ▼
GitHub Actions
  ├─ validate all Initial Context files with JSON Schema + Ajv
  ├─ build the builder and static route renderer
  ├─ record commit SHA and each config digest
  └─ deploy the complete Pages artifact
        ▼
GitHub Pages
  ├─ /<repo>/           builder
  └─ /<repo>/<PathName>/ published landing page
```

### Data and route rules

- Keep the SOW's required fields: `templateVersion`, `pathName`, `displayName`, `title`, `subtitle`, `theme`, and `sections`.
- Allow only approved themes, sections, and content fields. Configuration must not accept executable JavaScript, secrets, IAM policy, or arbitrary route definitions.
- Validate `PathName` as lowercase letters, digits, and hyphens; reject empty values, traversal-like input, and reserved names. Because SafiChat's reserved route list is unavailable, prototype reservations are temporary and must be reconciled before SAFI integration.
- Treat the path name as a URL identifier, never as an unchecked filesystem path.
- Escape/render text as data; do not interpret user-supplied content as HTML or script.
- The builder uses `schema/root-spa.schema.json` and downloads valid config as `initial-context.json`; the user places it under the matching `instances/<PathName>/` directory and reviews the Git change.
- The Pages app renders the builder at its base path and a visitor-facing landing page when the path matches a committed instance. Unknown paths show a not-found page.
- The build validator checks every `instances/*/initial-context.json` for schema validity, reserved/duplicate names, and directory/name agreement. Release metadata includes the source SHA and config digests.
- Account for the Pages project base path in Vite routing. Direct navigation and refresh use the Pages `404.html` fallback and must be checked after deployment.

### Future SAFI deployment shape

When the required SAFI services are available, preserve the SPA/schema work and replace the preview adapter:

```text
Native SafiChat UI + Cognito Publisher authorization
        │ validated create/edit/preview/publish request
        ▼
Trusted SAFI service or protected runner → SAFI Git commit
        │ approved commit SHA; schema/build checks pass
        ▼
Versioned EFS release → atomic active-release switch
        │
        ▼
Existing SafiChat HTTPS host serves /<PathName>
```

The SAFI release should retain prior release evidence and record the source SHA and Initial Context digest. The actual route/reverse proxy and EFS mechanics must be designed against SAFI's supplied environment; this document does not assume or invent its hostnames, role names, mounts, or repository.

## 5. Prerequisites and current status

### Available by the user's direction

- This machine as the development environment.
- Dyad on this machine.
- User-owned GitHub repository as the temporary source/config authority.
- GitHub Actions as the intended build/publish runner.
- GitHub Pages as the intended shareable preview host.
- SafiChat URL/source and its reserved paths may be represented by placeholders.
- Cognito is unavailable and skipped for prototype work.

### Still needed for a live preview

- GitHub Pages enabled for the repository with GitHub Actions as the source.
- The reviewed implementation pushed to `main`; Dyad or assistant-created changes are not pushed automatically.
- A successful Pages workflow run, followed by direct-route and refresh checks.

### Required before calling the SOW deliverable complete

- Working SafiChat URL and access to native frontend/backend source.
- SAFI-controlled Git repository and assigned-branch write permissions.
- SAFI development machine and scoped IAM role.
- Accessible EFS location and approved release layout.
- Existing HTTPS server/reverse proxy configured for the subordinate SPA route and refresh/deep-link fallback.
- Working Cognito login and Publisher test identity.
- A trusted SAFI-controlled publish runner or service.
- SafiChat reserved routes, final hostname, exact repository/roles/mount details.
- A secure authenticated Git/config commit mechanism and Publisher authorization path.
- A SAFI tester for end-to-end acceptance and handover.

The SOW explicitly says to report blocked before its six-hour delivery clock starts if these production prerequisites are missing or if SafiChat cannot safely serve the subordinate page. The prototype can proceed separately if it is understood to be prototype work and is not represented as final SOW acceptance.

## 6. Build sequence

1. **Completed locally:** Root SPA builder, editable preview, theme controls, schema validation, and Dyad design work.
2. **Completed locally:** validated configuration download and static visitor route for every committed `instances/<PathName>/initial-context.json`.
3. **Completed locally:** CI validation for all instances, Pages fallback, and release manifest with source SHA and per-site context digests.
4. **Pending deployment setup:** enable GitHub Pages with GitHub Actions as source and push the reviewed implementation to `main`.
5. **After deployment:** verify the builder and each site route, refresh/deep link, invalid-config CI rejection, update at a stable URL, and config rollback.
6. **SAFI migration:** replace manual config-to-Git publication with authorized native SafiChat controls and SAFI's trusted EFS publisher.

## 7. Prototype acceptance checklist

- [ ] A responsive landing page loads from the public/shareable Pages preview.
- [x] The SPA renders committed instances as visitor-facing pages; every config is checked against the schema before build.
- [x] Unsafe, duplicate, and prototype-reserved path names are rejected; final reserved-name checking is pending SAFI data.
- [x] User can edit approved content/theme fields, preview, and download a validated config without editing source code; publishing requires a reviewed Git change.
- [x] GitHub Actions builds committed source/config and writes SHA/config digests to the release manifest.
- [ ] Preview URL handles navigation, refresh, and direct path loads.
- [x] Reverting a prior config commit and pushing it restores that page's previous content at the same URL.
- [ ] No credentials or secrets are committed or bundled into client assets.
- [x] README explains preview operation and lists all remaining SOW blockers.

These checks establish the prototype only. Cognito authorization, native SafiChat integration, JetStream non-regression, SAFI Git policy, EFS publication, and SAFI route behavior remain unverified until those systems are supplied.
