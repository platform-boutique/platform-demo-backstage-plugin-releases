import { Chip, makeStyles } from '@material-ui/core';
import { Table, TableColumn } from '@backstage/core-components';
import { AppRelease, ReleaseState } from '../types';

const useStyles = makeStyles(theme => ({
  chip: { fontWeight: 600, height: 22, color: '#fff' },
  ok: { background: theme.palette.success?.main ?? '#2e7d32' },
  warn: { background: theme.palette.warning?.main ?? '#ed6c02' },
  bad: { background: theme.palette.error.main },
  neutral: { background: theme.palette.grey[600] },
  mono: { fontFamily: 'monospace', fontSize: '0.8rem' },
}));

const STATE: Record<ReleaseState, { label: string; cls: 'ok' | 'warn' | 'bad' | 'neutral' }> = {
  'in-sync': { label: 'running what is declared', cls: 'ok' },
  'rolling-out': { label: 'rolling out', cls: 'warn' },
  drift: { label: 'differs from declared', cls: 'bad' },
  'no-desired': { label: 'no digest declared', cls: 'neutral' },
  'not-deployed': { label: 'not deployed', cls: 'neutral' },
};

const short = (d?: string) => (d ? d.replace('sha256:', '').slice(0, 12) : '-');

export function ReleasesTable(props: { releases: AppRelease[]; title: string; showApp?: boolean }) {
  const c = useStyles();
  const columns: TableColumn<AppRelease>[] = [
    ...(props.showApp ? [{ title: 'Application', field: 'app' } as TableColumn<AppRelease>] : []),
    { title: 'Env', field: 'env', width: '5em' },
    {
      title: 'State',
      field: 'state',
      render: r => <Chip size="small" className={`${c.chip} ${c[STATE[r.state].cls]}`} label={STATE[r.state].label} />,
    },
    { title: 'Argo CD', render: r => `${r.sync} / ${r.health}` },
    { title: 'Running', render: r => <span className={c.mono}>{short(r.deployedDigest)}</span> },
    { title: 'Declared', render: r => <span className={c.mono}>{short(r.desiredDigest)}</span> },
    { title: 'Revision', render: r => <span className={c.mono}>{r.revision ?? '-'}</span> },
  ];
  return (
    <Table<AppRelease>
      title={props.title}
      columns={columns}
      data={props.releases}
      options={{ paging: props.releases.length > 20, pageSize: 20, search: props.releases.length > 8, padding: 'dense' }}
    />
  );
}
