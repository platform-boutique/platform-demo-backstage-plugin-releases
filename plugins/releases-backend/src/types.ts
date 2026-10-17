export type ReleaseState =
  | 'in-sync' // the image that runs is the image the repository declares
  | 'rolling-out' // declared and running differ and Argo CD is working on it
  | 'drift' // declared and running differ and nothing is happening
  | 'no-desired' // the repository declares no digest (placeholder values)
  | 'not-deployed';

export interface AppRelease {
  /** Argo CD Application name, e.g. dev-frontend */
  application: string;
  env: string;
  app: string;
  kind?: string;
  sync: string;
  health: string;
  /** Git revision Argo CD last synced */
  revision?: string;
  syncedAt?: string;
  /** images Argo CD sees in the live objects (`status.summary.images`) */
  images: string[];
  /** digest of the first image that carries one */
  deployedDigest?: string;
  /** image.digest declared in the environment's values file */
  desiredDigest?: string;
  desiredError?: string;
  state: ReleaseState;
}

export interface LatestTag {
  tag?: string;
  repo: string;
  error?: string;
}
