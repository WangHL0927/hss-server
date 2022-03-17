#!/usr/bin/env node

import Koa from 'koa';
import * as buildInfo from './package.json';
import cors from '@koa/cors';
import koaLogger from 'koa-logger';
import {getLogger} from 'log4js';
import send from 'koa-send';
import responseTime from 'koa-response-time';
import etag from 'koa-etag';
import * as fs from 'fs';

import minimist from 'minimist';
import * as path from 'path';

const argv = minimist(process.argv.slice(2));
const root = argv.r || argv.root || '.';
const port = argv.p || argv.port || 80;
const index = argv.i || argv.index || 'index.html';

// spa option.
const page404 = argv.p4 || argv.page404 || 'index.html';

const logLevel = argv.ll || argv.log || 'info';

const logger = getLogger('http');

if (['info', 'debug'].includes(logLevel)) {
  logger.level = logLevel;
} else {
  logger.level = 'info';
}

logger.debug(argv)
logger.debug(port, root, index, page404, logLevel)

export async function startServer() {
  logger.info('Name:', buildInfo.name);
  logger.info('Version:', buildInfo.version);
  logger.info('Start http server...');
  const app = new Koa();

  app.use(responseTime());
  app.use(cors());
  app.use(etag());

  app.use(async (ctx, next) => {
    if (ctx.request.method !== 'HEAD') {
      // alibaba slb ip.
      logger.info(`  <-- IP ${ctx.get('X-Forwarded-For') || ctx.request.ip}`);
    }
    await next();
  });

  app.use(koaLogger((str, args) => {
    if (args[1] !== 'HEAD') {
      logger.info(str);
    }
  }));

  app.use(async (ctx, next) => {
    if (ctx.fresh) {
      ctx.status = 304;
      return;
    } else {
      await next();
    }
  })

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
