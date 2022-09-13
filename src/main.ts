#!/usr/bin/env node --experimental-specifier-resolution=node --no-warnings
import chalk from 'chalk';
import download from 'download';
import extractZip from 'extract-zip';
import { existsSync } from 'node:fs';
import { copyFile, rename, rm, unlink } from 'node:fs/promises';
import { clearLine } from './utils/clear-line.function';
import { logInfo } from './utils/log-info.function';
import { runCommand } from './utils/run-command.function';

process.on('uncaughtException', () => {
  process.exit(1);
});

const repositoryUrl =
  'https://github.com/northerjs/norther/archive/refs/heads/main.zip';

const cwd = process.cwd();
const zipPath = `${cwd}/norther.zip`;
const appName = process.argv[2] ?? 'norther';

try {
  logInfo('Downloading files...');

  await download(repositoryUrl, cwd, {
    filename: 'norther.zip',
  });

  logInfo('Extracting files...');

  await extractZip(zipPath, {
    dir: cwd,
  });

  await unlink(zipPath);

  logInfo('Initializing project...');

  await rename(`${cwd}/norther-main`, appName);

  await rm(`${cwd}/${appName}/.github`, {
    recursive: true,
  });

  logInfo('Copying files...');

  await copyFile(`${cwd}/${appName}/.env.example`, `${cwd}/${appName}/.env`);

  logInfo('Installing packages...');

  runCommand('npm install');

  logInfo(`Project ${appName} has been created`);
  logInfo(`Run ${chalk.bold('cd ' + appName + ' && npm start')} to run your app`);
} catch (error) {
  console.error(chalk.redBright('Installation failed: ', error));

  const appDirectory = `${cwd}/${appName}`;

  if (existsSync(appDirectory)) {
    rm(appDirectory);
  }

  process.exit(1);
}
