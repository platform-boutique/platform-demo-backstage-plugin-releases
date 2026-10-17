# platform-demo-backstage-plugin-releases

Backstage plugin for the platform-demo portal: a **Releases** tab per service and a **Releases** page that compare what Argo CD
runs with what the Helm repository declares, plus the latest release tag.

| Package | Path |
|---|---|
| `@platform-boutique/backstage-plugin-releases` (frontend) | `plugins/releases` |
| `@platform-boutique/backstage-plugin-releases-backend` | `plugins/releases-backend` |

Documentation: `docs/` (rendered in the portal). `yarn install && yarn tsc && yarn build` to develop.
