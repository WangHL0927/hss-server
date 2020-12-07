#!/usr/bin/env node

import Koa from 'koa';
import * as buildInfo from './package.json';
import zlib from "zlib";
import cors from '@koa/cors';
import koaBody from 'koa-body';
import koaLogger from 'koa-logger';
import koaCompress from 'koa-compress';
import { getLogger } from 'log4js';
import Router from 'koa-router';
import send from 'koa-send';

import minimist from 'minimist';
import path from 'path';

const argv = minimist(process.argv.slice(2));
const root = path.join(__dirname, (argv.r || '')) || path.join(__dirname, argv.root || '') || path.join(__dirname, '.');
const port = argv.p || argv.port || 80;
const index = argv.i || argv.index || 'index.html';
const page404 = argv.p4 || argv.page404 || 'index.html';
const max = argv.m || argv.maxage || 7 * 24 * 3600 * 1000; // 7 days

const logger = getLogger('http');
logger.level = 'info';

export async function startServer() {
  logger.info('Name:', buildInfo.name);
  logger.info('Version:', buildInfo.version);
  logger.info('Start http server...');
  const app = new Koa();
  app.use(async (ctx, next) => {
    if (ctx.request.method !== 'HEAD') {
      logger.info(`client ip -> ${ctx.get('X-Forwarded-For')}`);
    }
    await next();
  });
  app.use(koaLogger((str, args) => {
    if (args[1] !== 'HEAD') {
      logger.info(str);
    }
  }));
  app.use(cors());
  app.use(koaCompress({
    threshold: 2048,
    gzip: {
      flush: zlib.constants.Z_SYNC_FLUSH
    },
    deflate: {
      flush: zlib.constants.Z_SYNC_FLUSH,
    },
    br: {
      flush: zlib.constants.BROTLI_OPERATION_FLUSH,
    }
  }));
  app.use(koaBody());

  const liveCheckRouter = new Router();
  liveCheckRouter.head('/ping', (ctx) => ctx.body = 'ok');
  liveCheckRouter.post('/ping', (ctx) => ctx.body = 'ok');
  app.use(liveCheckRouter.routes());
  app.use(liveCheckRouter.allowedMethods());

  app.use(async (ctx) => {

    const opts = {
      index: index,
      root: root,
      maxage: max,
    };

    const ext = path.extname(ctx.path);

    if (ctx.path === '/' || ext === 'html') {
      opts.maxage = 0; // no cache
    }

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
