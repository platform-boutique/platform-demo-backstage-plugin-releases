# releases

Frontend plugin of `@platform-boutique/backstage-plugin-releases` (Releases): the **Releases** tab and page: what Argo CD runs against what the Helm repository declares. It is written for Backstage's new frontend
system and has a default export, so an app with `app.packages: all` picks it up.

This repository has no Backstage app of its own. The plugin is packed (`yarn pack`) and consumed by `platform-demo-backstage`; see the
repository README and `docs/` (install and configuration) for how.
