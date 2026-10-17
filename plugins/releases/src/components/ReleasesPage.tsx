import { useApi } from '@backstage/frontend-plugin-api';
import { Content, Header, Page, Progress, ResponseErrorPanel } from '@backstage/core-components';
import useAsync from 'react-use/esm/useAsync';
import { releasesApiRef } from '../api';
import { ReleasesTable } from './ReleasesTable';

export function ReleasesPage() {
  const api = useApi(releasesApiRef);
  const state = useAsync(() => api.overview(), []);
  return (
    <Page themeId="tool">
      <Header title="Releases" subtitle="What every environment runs, and whether it is what the repository declares" />
      <Content>
        {state.loading && <Progress />}
        {state.error && <ResponseErrorPanel error={state.error} />}
        {state.value && <ReleasesTable releases={state.value} title="All applications" showApp />}
      </Content>
    </Page>
  );
}
