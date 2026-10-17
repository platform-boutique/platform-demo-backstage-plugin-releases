import { createApiRef, DiscoveryApi, FetchApi } from '@backstage/frontend-plugin-api';
import { ResponseError } from '@backstage/errors';
import { AppRelease, LatestTag } from './types';

export interface ReleasesApi {
  overview(): Promise<AppRelease[]>;
  service(name: string, repo?: string): Promise<{ releases: AppRelease[]; latest?: LatestTag }>;
}

export const releasesApiRef = createApiRef<ReleasesApi>({ id: 'plugin.releases.service' });

export class ReleasesClient implements ReleasesApi {
  constructor(private readonly deps: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {}

  private async get<T>(path: string): Promise<T> {
    const base = await this.deps.discoveryApi.getBaseUrl('releases');
    const res = await this.deps.fetchApi.fetch(`${base}${path}`);
    if (!res.ok) throw await ResponseError.fromResponse(res);
    return res.json();
  }

  async overview() {
    return (await this.get<{ releases: AppRelease[] }>('/overview')).releases;
  }

  service(name: string, repo?: string) {
    return this.get<{ releases: AppRelease[]; latest?: LatestTag }>(
      `/service/${encodeURIComponent(name)}${repo ? `?repo=${encodeURIComponent(repo)}` : ''}`,
    );
  }
}
