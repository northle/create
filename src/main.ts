#!/usr/bin/env node --experimental-specifier-resolution=node --no-warnings
import extractZip from 'extract-zip';
import download from 'download';
import { copyFile, rename, unlink, rm } from 'node:fs/promises';
import chalk from 'chalk';

process.on('uncaughtException', () => {
  process.exit(1);
});

const clearLine = () => {
  process.stdout.moveCursor(0, -1);
  process.stdout.clearLine(1);
};

const logInfo = (data: string) => {
  clearLine();

  console.log(`${chalk.bold.green(data)}`);
}

const repositoryUrl = 'https://github.com/northerjs/norther/archive/refs/heads/main.zip';
const zipPath = `${process.cwd()}/norther.zip`;
const appName = process.argv[2] ?? 'norther';

try {
  logInfo('Downloading files...');

  await download(repositoryUrl, process.cwd(), {
    filename: 'norther.zip',
  });

  logInfo('Extracting files...');

  await extractZip(zipPath, {
    dir: process.cwd(),
  });

  await unlink(zipPath);

  logInfo('Initializing project...');

  await rename(`${process.cwd()}/norther-main`, appName);

  await rm(`${process.cwd()}/${appName}/.github`, {
    recursive: true,
  });

  logInfo('Copying files...');

  await copyFile(`${process.cwd()}/${appName}/.env.example`, `${process.cwd()}/${appName}/.env`);

  logInfo('Installing packages...');
} catch (error) {
  console.error(chalk.redBright('Installation failed'));

  process.exit(1);
}
