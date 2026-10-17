import {
  ApiBlueprint,
  PageBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { releasesApiRef, ReleasesClient } from './api';
import { rootRouteRef } from './routes';

const releasesApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: releasesApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: deps => new ReleasesClient(deps),
    }),
});

/** Tab "Releases" on every entity that names its Argo CD application. */
const entityReleasesContent = EntityContentBlueprint.make({
  name: 'releases',
  params: {
    path: '/releases',
    title: 'Releases',
    filter: entity => Boolean(entity.metadata.annotations?.['argocd/app-name']),
    loader: () => import('./components/EntityReleasesContent').then(m => <m.EntityReleasesContent />),
  },
});

const releasesPage = PageBlueprint.make({
  params: {
    path: '/releases',
    title: 'Releases',
    routeRef: rootRouteRef,
    loader: () => import('./components/ReleasesPage').then(m => <m.ReleasesPage />),
  },
});

export const releasesPlugin = createFrontendPlugin({
  pluginId: 'releases',
  extensions: [releasesApi, entityReleasesContent, releasesPage],
  routes: { root: rootRouteRef },
});
