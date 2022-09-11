#!/usr/bin/env node --experimental-specifier-resolution=node --no-warnings
import { createWriteStream } from 'node:fs';
import { get } from 'node:https';
import extractZip from 'extract-zip';

process.on('uncaughtException', () => {
  process.exit(1);
});

const repositoryUrl = 'https://github.com/northerjs/norther/archive/refs/heads/main.zip';

get(repositoryUrl, (request) => {
  const path = `${process.cwd()}/norther.zip`;
  const file = createWriteStream(path);

  request.pipe(file);

  file.on('finish', async () => {
    file.close();

    try {
      await extractZip(path, {
        dir: process.cwd(),
      });
    } catch (error) {
      process.exit(1);
    }
  });
});
