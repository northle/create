#!/usr/bin/env node --experimental-specifier-resolution=node --no-warnings
import { createWriteStream } from 'node:fs';
import { get } from 'node:https';

process.on('uncaughtException', () => {
  process.exit(1);
});

const repositoryUrl = 'https://github.com/northerjs/norther/archive/refs/heads/main.zip';

get(repositoryUrl, (request) => {
  const path = createWriteStream(`${process.cwd()}/norther.zip`);

  request.pipe(path);

  path.on('finish', () => {
    path.close();
  });
});
