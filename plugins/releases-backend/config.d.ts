export interface Config {
  /** Releases plugin configuration */
  releases?: {
    /**
     * Namespace of the Argo CD Applications.
     * @default argocd
     */
    argocdNamespace?: string;
    /**
     * Where the desired image of an application is declared: the values file of the environment in the Helm repository.
     * `{env}` and `{app}` are replaced (the Argo CD Application is `<env>-<app>`). Read through Backstage's URL reader, so
     * the host must be allowed there (a GitHub integration, or backend.reading.allow).
     * @default https://github.com/platform-boutique/platform-demo-helm/blob/main/envs/{env}/values/{app}.yaml
     */
    valuesUrl?: string;
    /** Look up the latest release tag on GitHub (needs api.github.com; uses the GitHub integration's token when there is one). @default true */
    latestTag?: boolean;
  };
}
