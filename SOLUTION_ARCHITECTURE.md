# Root SPA Prototype: Scope and Architecture

**Status:** Starter scaffold created; implementation and preview publication are not complete.  
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
| SAFI Git repository | User's own GitHub repository | Enables version control and review now. Later, transfer or adapt the work to the SAFI-controlled repository and its branch rules. The repo URL and access are not yet present in this workspace. |
| SAFI developer machine | This machine | Dyad and local development will run here. |
| EFS | GitHub Pages deployment artifact/site | Gives a shareable static preview from the same Git project. Pages is static hosting, not a filesystem mount, EFS release directory, or SAFI deployment target. |
| Trusted SAFI runner | GitHub Actions | Can validate and build committed revisions and publish the preview. It cannot write to this machine's disk from a hosted runner. |
| SafiChat shell and route | Placeholder route/configuration | SafiChat source, URL, and reserved routes are unavailable. Preview routing will be tested on the Pages URL and must be adapted to SAFI's actual host/path later. |
| Cognito and Publisher role | Omitted in the prototype | Cognito is unavailable and explicitly skipped for now. No production identity or authorization claim can be made. Any development-only editor access is a demo convenience, not a security boundary. |
| User-config-to-Git commit | GitHub workflow/manual repository operation, to be finalized | A static browser app cannot safely hold a GitHub credential. Do not put a PAT, app secret, or other privileged credential in client code. A secure authenticated service or SAFI-controlled runner is needed for the eventual in-app publish action. |

GitHub Pages supports static site publication and custom 404 pages; client-side deep-link behavior still needs an explicit fallback and deployed verification. The Pages preview URL may include the repository name and will not be the final SafiChat `/<PathName>` URL. See [GitHub Pages](https://pages.github.com/) and [GitHub Pages 404 guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites).

## 3. Prototype scope

The prototype should produce:

1. A responsive, visually polished Root SPA built with React, TypeScript, and Vite.
2. A constrained Initial Context schema and example instance, with Ajv validation and safe rendering of content.
3. A simple Create/Edit/Preview experience operating on the prototype configuration. It must not imply Cognito authorization or persist GitHub credentials in the browser.
4. A committed-source GitHub Actions workflow that validates the schema/configuration, builds the static site, and publishes a shareable GitHub Pages preview.
5. Release metadata/evidence sufficient to identify the commit and config digest used for a preview build. Rollback for the preview means redeploying a known-good committed revision; it is not the SOW's EFS release-pointer rollback.
6. An operator/developer README with local run, build, preview publication, and rollback instructions.

The prototype does not include a SafiChat backend, Cognito, JetStream changes, a privileged GitHub-writing service, EFS, or a claim of production authorization. A form preview may work locally or in the preview site, but durable user edits require a secure write path that is not present in a static Pages deployment.

## 4. Architecture

```text
Dyad on this machine
        │ edit source and configuration
        ▼
User's GitHub repository (source and config history)
        │ push committed revision
        ▼
GitHub Actions
  ├─ validate Initial Context with JSON Schema + Ajv
  ├─ build Vite static assets
  ├─ record commit SHA and config digest
  └─ publish preview
        ▼
GitHub Pages (shareable static preview)
```

### Data and route rules

- Keep the SOW's required fields: `templateVersion`, `pathName`, `displayName`, `title`, `subtitle`, `theme`, and `sections`.
- Allow only approved themes, sections, and content fields. Configuration must not accept executable JavaScript, secrets, IAM policy, or arbitrary route definitions.
- Validate `PathName` as lowercase letters, digits, and hyphens; reject empty values, traversal-like input, and reserved names. Because SafiChat's reserved route list is unavailable, prototype reservations are temporary and must be reconciled before SAFI integration.
- Treat the path name as a URL identifier, never as an unchecked filesystem path.
- Escape/render text as data; do not interpret user-supplied content as HTML or script.
- Account for the Pages project base path in Vite/router configuration. Test direct navigation, refresh, and in-app navigation at the deployed preview URL.

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

## 5. Requirements before implementation

### Available by the user's direction

- This machine as the development environment.
- Dyad on this machine (availability should be confirmed when starting).
- User-owned GitHub repository as the temporary source/config authority.
- GitHub Actions as the intended build/publish runner.
- GitHub Pages as the intended shareable preview host.
- SafiChat URL/source and its reserved paths may be represented by placeholders.
- Cognito is unavailable and skipped for prototype work.

### Still needed to configure the preview

- GitHub repository URL and confirmation that it is cloned or otherwise available in this workspace.
- Permission/ability to push workflow and site changes to that repository.
- GitHub Pages enabled for the repository, with Actions allowed to publish Pages and workflow permissions configured for Pages deployment.
- The desired temporary `PathName` (or approval to use a clearly labeled example such as `demo-site`).
- Any desired product name, copy, imagery, or visual references; otherwise use clearly editable sample content.

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

1. **Repository and preview setup:** confirm repo access, initialize the project if needed, set the temporary site path, and configure Pages/Actions.
2. **Root SPA and visual design:** build the responsive landing page in Dyad and commit the source.
3. **Configuration contract:** define the frozen schema, example Initial Context, approved themes/sections, and Ajv validation.
4. **Edit and preview:** build a constrained form and preview against validated configuration. Keep auth clearly in prototype mode; do not expose a publish credential to the browser.
5. **Build and publish workflow:** run validation/build on committed changes; publish to Pages; record SHA/config digest; document how to redeploy a known-good commit.
6. **Verify and document:** inspect desktop/mobile rendering, path behavior, refresh/deep links, invalid input rejection, preview publication, and rollback procedure. Record the prototype limitations and the SAFI migration requirements.

## 7. Prototype acceptance checklist

- [ ] A responsive landing page loads from the public/shareable Pages preview.
- [ ] The SPA renders a valid example Initial Context and rejects malformed/unsupported configuration before build or preview.
- [ ] Unsafe and duplicate prototype path names are rejected; final reserved-name checking is marked pending SAFI data.
- [ ] User can edit approved content/theme fields and preview without editing source code; persistence is explicitly described as prototype-only unless a secure write service is added.
- [ ] GitHub Actions builds only committed source and publishes the result; SHA and config digest are recorded.
- [ ] Preview URL handles navigation, refresh, and direct path loads.
- [ ] A prior known-good commit can be redeployed to restore the preview.
- [ ] No credentials or secrets are committed or bundled into client assets.
- [ ] README explains preview operation and lists all remaining SOW blockers.

These checks establish the prototype only. Cognito authorization, native SafiChat integration, JetStream non-regression, SAFI Git policy, EFS publication, and SAFI route behavior remain unverified until those systems are supplied.
