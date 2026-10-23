# releases-backend

Backend plugin of `@platform-boutique/backstage-plugin-releases` (Releases); it serves the API under `/api/releases` for the frontend plugin.

Add it to a Backstage backend in `packages/backend/src/index.ts`:

```ts
backend.add(import('@platform-boutique/backstage-plugin-releases-backend'));
```

This repository has no Backstage app of its own. The plugin is packed (`yarn pack`) and consumed by `platform-demo-backstage`; see the
repository README and `docs/` (install and configuration) for how.
