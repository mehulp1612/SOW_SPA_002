# Dyad project rules

- Work in the existing React + TypeScript + Vite structure; keep the prototype easy to migrate into SAFI's repository.
- Treat `schema/root-spa.schema.json` as the configuration contract. Update it deliberately when supported fields change, and keep the example at `instances/demo-site/initial-context.json` valid.
- Keep content data separate from rendering. Do not add executable JavaScript, secrets, IAM policy, or arbitrary routes to Initial Context.
- Keep PathName validation in place. Path names are URL identifiers and must never be concatenated into filesystem paths.
- Keep the editor and page preview responsive, accessible, keyboard usable, and labeled. Preserve clear invalid, valid, and prototype-only states.
- Never put GitHub tokens, Cognito secrets, or other credentials in browser code, committed files, or built assets.
- This is a static prototype. Do not imply that edits persist to GitHub or are authorized by Cognito. Do not invent SafiChat APIs, routes, hostnames, roles, or EFS paths.
- Keep changes small and coherent. Prefer existing dependencies; do not add a UI framework without a clear need.
- Avoid adding tests or running test suites unless the user asks. Keep the build and configuration validation scripts useful for local and CI setup.
