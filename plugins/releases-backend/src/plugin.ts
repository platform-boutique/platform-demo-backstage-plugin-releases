import { coreServices, createBackendPlugin } from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { ReleasesService } from './service';

/**
 * Backend of the Releases view: joins what Argo CD runs with what the Helm repository declares and the latest release tag.
 *
 *   releases:
 *     valuesUrl: https://github.com/platform-boutique/platform-demo-helm/blob/main/envs/{env}/values/{app}.yaml
 *
 * Needs the Kubernetes permission to list Argo CD Applications (the portal's ClusterRole has it).
 *
 * @public
 */
export const releasesPlugin = createBackendPlugin({
  pluginId: 'releases',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        urlReader: coreServices.urlReader,
      },
      async init({ config, httpAuth, httpRouter, logger, urlReader }) {
        const service = new ReleasesService({
          logger,
          urlReader,
          argocdNamespace: config.getOptionalString('releases.argocdNamespace') ?? 'argocd',
          valuesUrl:
            config.getOptionalString('releases.valuesUrl') ??
            'https://github.com/platform-boutique/platform-demo-helm/blob/main/envs/{env}/values/{app}.yaml',
          githubToken: config.getOptionalConfigArray('integrations.github')?.[0]?.getOptionalString('token') || undefined,
          latestTag: config.getOptionalBoolean('releases.latestTag') ?? true,
        });
        httpRouter.use(await createRouter({ httpAuth, service }));
      },
    });
  },
});
