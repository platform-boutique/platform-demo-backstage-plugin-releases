import { LoggerService, UrlReaderService } from '@backstage/backend-plugin-api';
import { KubeConfig, CustomObjectsApi } from '@kubernetes/client-node';
import { parse as parseYaml } from 'yaml';
import { AppRelease, LatestTag, ReleaseState } from './types';

export interface ServiceOptions {
  logger: LoggerService;
  urlReader: UrlReaderService;
  argocdNamespace: string;
  valuesUrl: string;
  githubToken?: string;
  latestTag: boolean;
}

const DIGEST = /@(sha256:[0-9a-f]{64})/;

export class ReleasesService {
  private readonly api: CustomObjectsApi;

  constructor(private readonly o: ServiceOptions) {
    const kc = new KubeConfig();
    kc.loadFromDefault(); // in a pod: the ServiceAccount; on a laptop: the current kube context
    this.api = kc.makeApiClient(CustomObjectsApi);
  }

  private async desiredDigest(env: string, app: string): Promise<{ digest?: string; error?: string }> {
    const url = this.o.valuesUrl.replace('{env}', env).replace('{app}', app);
    try {
      const file = await this.o.urlReader.readUrl(url);
      const values = parseYaml((await file.buffer()).toString('utf8')) as { image?: { digest?: string } } | null;
      const digest = values?.image?.digest;
      return digest ? { digest } : {};
    } catch (e) {
      // not every application has a values file with an image (monitoring-local, platform-gateway ...)
      return { error: (e as Error).name === 'NotFoundError' ? undefined : (e as Error).message };
    }
  }

  async list(): Promise<AppRelease[]> {
    const res = (await this.api.listNamespacedCustomObject({
      group: 'argoproj.io',
      version: 'v1alpha1',
      namespace: this.o.argocdNamespace,
      plural: 'applications',
      labelSelector: 'platform.demo/env',
    })) as { items?: any[] };

    const out = await Promise.all(
      (res.items ?? []).map(async (a): Promise<AppRelease> => {
        const labels = a.metadata?.labels ?? {};
        const env = labels['platform.demo/env'] as string;
        const name = a.metadata.name as string;
        const app = name.startsWith(`${env}-`) ? name.slice(env.length + 1) : name;
        const images: string[] = a.status?.summary?.images ?? [];
        const deployedDigest = images.map(i => DIGEST.exec(i)?.[1]).find(Boolean);
        const { digest: desiredDigest, error: desiredError } = await this.desiredDigest(env, app);
        const sync = a.status?.sync?.status ?? 'Unknown';
        const health = a.status?.health?.status ?? 'Unknown';
        let state: ReleaseState;
        if (!images.length) state = 'not-deployed';
        else if (!desiredDigest || !deployedDigest) state = 'no-desired';
        else if (desiredDigest === deployedDigest) state = 'in-sync';
        else state = a.status?.operationState?.phase === 'Running' || health === 'Progressing' ? 'rolling-out' : 'drift';
        return {
          application: name,
          env,
          app,
          kind: labels['platform.demo/kind'],
          sync,
          health,
          revision: a.status?.sync?.revision?.slice(0, 7),
          syncedAt: a.status?.operationState?.finishedAt ?? a.status?.reconciledAt,
          images,
          deployedDigest,
          desiredDigest,
          desiredError,
          state,
        };
      }),
    );
    return out.sort((x, y) => x.env.localeCompare(y.env) || x.app.localeCompare(y.app));
  }

  /** Highest vX.Y.Z tag of a GitHub repository (owner/name). Failure is reported, not thrown: the rest of the page still works. */
  async latestTag(repo: string): Promise<LatestTag> {
    if (!this.o.latestTag) return { repo, error: 'disabled' };
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) return { repo, error: 'invalid repository' };
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/tags?per_page=50`, {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(this.o.githubToken ? { Authorization: `Bearer ${this.o.githubToken}` } : {}),
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return { repo, error: `GitHub answered ${res.status}` };
      const tags = ((await res.json()) as { name: string }[])
        .map(t => t.name)
        .filter(n => /^v\d+\.\d+\.\d+$/.test(n))
        .sort((a, b) => {
          const pa = a.slice(1).split('.').map(Number);
          const pb = b.slice(1).split('.').map(Number);
          return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
        });
      return { repo, tag: tags[0] };
    } catch (e) {
      this.o.logger.debug(`releases: latest tag of ${repo}: ${(e as Error).message}`);
      return { repo, error: 'GitHub is not reachable' };
    }
  }
}
