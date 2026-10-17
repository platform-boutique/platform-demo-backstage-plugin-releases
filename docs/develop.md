# Develop

```bash
yarn install
yarn tsc
yarn build
yarn backstage-cli repo fix --publish
for p in releases releases-backend; do (cd plugins/$p && yarn pack --out ../../dist-pack/$p.tgz); done
```

Copy the tarballs into the portal's `vendor/` folder (see the Hubble plugin's *Install* page for why) and rebuild its image.

Running the backend against a cluster needs a kubeconfig that may list Argo CD Applications (`kubectl auth can-i list
applications.argoproj.io -n argocd`).
