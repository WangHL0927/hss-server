#!/usr/bin/env bash -e

npm run build
nrm use npm
npm publish
nrm use taobao




