#!/usr/bin/env bash
set -e

npm run build
nrm use npm
npm publish
nrm use taobao




