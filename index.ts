#!/usr/bin/env node

import Koa from 'koa';
import * as buildInfo from './package.json';
import cors from '@koa/cors';
import koaLogger from 'koa-logger';
import { getLogger } from 'log4js';
import send from 'koa-send';

import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const root = argv.r || argv.root || '.';
const port = argv.p || argv.port || 80;
const index = argv.i || argv.index || 'index.html';
const page404 = argv.p4 || argv.page404 || 'index.html';

const logger = getLogger('http');
logger.level = 'info';

export async function startServer() {
  logger.info('Name:', buildInfo.name);
  logger.info('Version:', buildInfo.version);
  logger.info('Start http server...');
  const app = new Koa();

  app.use(async (ctx, next) => {
    if (ctx.request.method !== 'HEAD') {
      logger.info(`  <-- IP ${ctx.get('X-Forwarded-For')}`);
    }
    await next();
  });

  app.use(koaLogger((str, args) => {
    if (args[1] !== 'HEAD') {
      logger.info(str);
    }
  }));

  app.use(cors());

  app.use(async (ctx) => {

    const opts = {
      index: index,
      root: root,
    };

    try {
      await send(ctx, ctx.path, opts);
    } catch (e) {
      try {
        await send(ctx, page404, opts);
      } catch (e) {
        ctx.status = 404;
        ctx.body = 'Not Found.';
      }
    }
  });

  app.listen(port);
  logger.info('Server listening port: ' + port);
}

startServer().catch(console.error);
