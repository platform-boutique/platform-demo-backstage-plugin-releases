import { HttpAuthService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { InputError } from '@backstage/errors';
import { ReleasesService } from './service';

export async function createRouter(o: { httpAuth: HttpAuthService; service: ReleasesService }): Promise<express.Router> {
  const router = Router();
  router.use(async (req, _res, next) => {
    await o.httpAuth.credentials(req, { allow: ['user'] });
    next();
  });

  /** Every Argo CD Application of every environment, with what runs and what the repository declares. */
  router.get('/overview', async (_req, res) => {
    res.json({ releases: await o.service.list() });
  });

  /** GET /service/frontend?repo=platform-boutique/app-frontend : its Applications plus the latest release tag. */
  router.get('/service/:name', async (req, res) => {
    const name = req.params.name;
    if (!/^[a-z0-9-]+$/.test(name)) throw new InputError('invalid service name');
    const repo = req.query.repo ? String(req.query.repo) : undefined;
    const [all, latest] = await Promise.all([o.service.list(), repo ? o.service.latestTag(repo) : undefined]);
    res.json({ releases: all.filter(r => r.app === name), latest });
  });

  return router;
}
