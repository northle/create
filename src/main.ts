#!/usr/bin/env node --experimental-specifier-resolution=node --no-warnings
import extractZip from 'extract-zip';
import download from 'download';
import { existsSync } from 'node:fs';
import { copyFile, rename, unlink, rm } from 'node:fs/promises';
import chalk from 'chalk';
import { runCommand } from './utils/run-command.function';

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

  if (existsSync(`${cwd}/${appName}`)) {
    rm(`${cwd}/${appName}`);
  }

  process.exit(1);
}
