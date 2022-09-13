#!/usr/bin/env node --experimental-specifier-resolution=node --no-warnings
import chalk from 'chalk';
import download from 'download';
import extractZip from 'extract-zip';
import { existsSync } from 'node:fs';
import { copyFile, readFile, rename, rm, unlink, writeFile } from 'node:fs/promises';
import { clearLine } from './utils/clear-line.function';
import { logInfo } from './utils/log-info.function';
import { randomBytes } from 'node:crypto';
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

  logInfo('✓ Files downloaded', true);
  logInfo('Extracting files...');

  await extractZip(zipPath, {
    dir: cwd,
  });

  await unlink(zipPath);

  logInfo('✓ Files extracted', true);
  logInfo('Initializing project...');

  await rename(`${cwd}/norther-main`, appName);

  await rm(`${cwd}/${appName}/.github`, {
    recursive: true,
  });

  logInfo('✓ Project initialized', true);
  logInfo('Configuring...');

  const envFile = `${cwd}/${appName}/.env`;

  await copyFile(`${cwd}/${appName}/.env.example`, envFile);

  const envContent = await readFile(envFile, 'utf8');

  await writeFile(envFile, envContent.replace('ENCRYPT_KEY=', `ENCRYPT_KEY=${randomBytes(16).toString('hex')}`));

  logInfo('✓ Configured', true);
  logInfo('Installing packages...');

  runCommand('npm install');

  logInfo('✓ Packages installed', true);

  setTimeout(() => {
    logInfo(`\nProject ${appName} has been created`);
    logInfo(`Run ${chalk.gray('cd')} ${chalk.white(appName)} ${chalk.gray('&&')} ${chalk.white('npm start')} to run your app`);
  }, 900);
} catch (error) {
  console.error(chalk.redBright('Installation failed: ', error));

  const appDirectory = `${cwd}/${appName}`;

  if (existsSync(appDirectory)) {
    rm(appDirectory);
  }

  process.exit(1);
}
