export type ReleaseState = 'in-sync' | 'rolling-out' | 'drift' | 'no-desired' | 'not-deployed';

export interface AppRelease {
  application: string;
  env: string;
  app: string;
  kind?: string;
  sync: string;
  health: string;
  revision?: string;
  syncedAt?: string;
  images: string[];
  deployedDigest?: string;
  desiredDigest?: string;
  desiredError?: string;
  state: ReleaseState;
}

export interface LatestTag {
  tag?: string;
  repo: string;
  error?: string;
}
