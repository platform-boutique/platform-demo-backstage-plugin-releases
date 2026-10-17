import { Chip, Table, TableBody, TableCell, TableHead, TableRow, makeStyles } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
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
  return (
    <InfoCard title={props.title} noPadding>
      <Table size="small">
        <TableHead>
          <TableRow>
            {props.showApp && <TableCell>Application</TableCell>}
            <TableCell>Env</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Argo CD</TableCell>
            <TableCell>Running</TableCell>
            <TableCell>Declared</TableCell>
            <TableCell>Revision</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.releases.map(r => (
            <TableRow key={r.application} hover>
              {props.showApp && <TableCell>{r.app}</TableCell>}
              <TableCell>{r.env}</TableCell>
              <TableCell>
                <Chip size="small" className={`${c.chip} ${c[STATE[r.state].cls]}`} label={STATE[r.state].label} />
              </TableCell>
              <TableCell>{`${r.sync} / ${r.health}`}</TableCell>
              <TableCell className={c.mono}>{short(r.deployedDigest)}</TableCell>
              <TableCell className={c.mono}>{short(r.desiredDigest)}</TableCell>
              <TableCell className={c.mono}>{r.revision ?? '-'}</TableCell>
            </TableRow>
          ))}
          {props.releases.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>No deployments found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </InfoCard>
  );
}
