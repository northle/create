#!/usr/bin/env node --experimental-specifier-resolution=node --no-warnings

process.on('uncaughtException', () => {
  process.exit(1);
});
