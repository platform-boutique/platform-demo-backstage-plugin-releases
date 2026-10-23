# Install and configure

| Package | Role |
|---|---|
| `@platform-boutique/backstage-plugin-releases` | Frontend plugin (new frontend system) |
| `@platform-boutique/backstage-plugin-releases-backend` | Backend plugin |

```ts title="packages/backend/src/index.ts"
backend.add(import('@platform-boutique/backstage-plugin-releases-backend'));
```

```yaml title="app-config.yaml"
releases:
  argocdNamespace: argocd
  valuesUrl: https://github.com/platform-boutique/platform-demo-helm/blob/main/envs/{env}/values/{app}.yaml
  latestTag: true
```

## What the cluster must allow

The portal's ServiceAccount needs `get`, `list` and `watch` on `applications.argoproj.io` (it has them: `backstage-read` in the Helm
repository's `backstage` chart). The host of `valuesUrl` must be readable by Backstage's URL reader: a GitHub integration for
github.com, or `backend.reading.allow` for anything else.

Entities need `argocd/app-name: <env>-<app>` and, for the latest tag, `github.com/project-slug: <owner>/<repo>`.
