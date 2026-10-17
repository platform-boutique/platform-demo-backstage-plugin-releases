import { useApi } from '@backstage/frontend-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard, MissingAnnotationEmptyState, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { Grid, Typography } from '@material-ui/core';
import useAsync from 'react-use/esm/useAsync';
import { releasesApiRef } from '../api';
import { ReleasesTable } from './ReleasesTable';

const APP = 'argocd/app-name';
const SLUG = 'github.com/project-slug';

export function EntityReleasesContent() {
  const { entity } = useEntity();
  const api = useApi(releasesApiRef);
  const annotations = entity.metadata.annotations ?? {};
  const application = annotations[APP];
  const slug = annotations[SLUG];
  // dev-frontend -> frontend: the Application name is <env>-<app>
  const app = application?.replace(/^[a-z]+-/, '');

  const state = useAsync(() => (app ? api.service(app, slug) : Promise.resolve(undefined)), [app, slug]);

  if (!application) return <MissingAnnotationEmptyState annotation={APP} />;
  if (state.loading) return <Progress />;
  if (state.error) return <ResponseErrorPanel error={state.error} />;
  const { releases = [], latest } = state.value ?? {};

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <InfoCard title="Latest release">
          <Typography variant="h4">{latest?.tag ?? '-'}</Typography>
          <Typography variant="body2" color="textSecondary">
            {latest?.tag
              ? `newest vX.Y.Z tag of ${latest.repo}`
              : latest?.error
              ? `not available: ${latest.error}`
              : 'no tag information'}
          </Typography>
        </InfoCard>
      </Grid>
      <Grid item xs={12} md={8}>
        <InfoCard title="How a release reaches the cluster">
          <Typography variant="body2">
            Push a <code>vX.Y.Z</code> tag → the release pipeline scans, signs and publishes the image → a pull request changes{' '}
            <code>image.digest</code> in <code>envs/&lt;env&gt;/values/{app}.yaml</code> → Argo CD rolls it out. The table compares
            the digest that <b>runs</b> with the digest the repository <b>declares</b>.
          </Typography>
        </InfoCard>
      </Grid>
      <Grid item xs={12}>
        <ReleasesTable releases={releases} title={`Deployments of ${app}`} />
      </Grid>
    </Grid>
  );
}
