#!/usr/bin/env node --experimental-specifier-resolution=node --no-warnings
import chalk from 'chalk';
import download from 'download';
import extractZip from 'extract-zip';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import {
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  unlink,
  writeFile,
} from 'node:fs/promises';
import prompt from 'prompts';
import { logError } from './utils/log-error.function';
import { logInfo } from './utils/log-info.function';
import { logProgress } from './utils/log-progress';
import { publishStub } from './utils/publish-stub.function';
import { runCommand } from './utils/run-command.function';

process.on('uncaughtException', () => {
  process.exit(1);
});

const repositoryUrl =
  'https://github.com/northerjs/norther/archive/refs/heads/main.zip';

const cwd = process.cwd();
const zipPath = `${cwd}/norther.zip`;

const appName = (
  process.argv[2] ??
  (
    await prompt({
      type: 'text',
      name: 'value',
      message: 'What is the name of your app?',
      validate: (value: string) =>
        /^[a-zA-Z0-9 _-]+$/.test(value)
          ? true
          : 'App name cannot contain special characters',
    })
  ).value
).replaceAll(' ', '-');

const manager = await prompt({
  type: 'select',
  name: 'value',
  message: 'What package manager do you want to use?',
  choices: [
    { title: 'npm', value: 'npm' },
    { title: 'pnpm', value: 'pnpm' },
    { title: 'yarn', value: 'yarn' },
  ],
  initial: 0,
});

const framework = await prompt({
  type: 'select',
  name: 'value',
  message: 'What frontend framework do you want to use?',
  choices: [
    { title: 'React', value: 'react' },
    { title: 'Vue', value: 'vue' },
    { title: "I don't want to use any of them", value: null },
  ],
  initial: 2,
});

try {
  logProgress('- Downloading files...');

  await download(repositoryUrl, cwd, {
    filename: 'norther.zip',
  });

  logInfo('√ Files downloaded', true);
  logProgress('- Extracting files...');

  await extractZip(zipPath, {
    dir: cwd,
  });

  await unlink(zipPath);

  logInfo('√ Files extracted', true);
  logProgress('- Initializing project...');

  await rename(`${cwd}/norther-main`, appName);

  await rm(`${cwd}/${appName}/.github`, {
    recursive: true,
  });

  logInfo('√ Project initialized', true);
  logProgress('- Configuring...');

  const envFile = `${cwd}/${appName}/.env`;

  await copyFile(`${cwd}/${appName}/.env.example`, envFile);

  const envContent = await readFile(envFile, 'utf8');

  await writeFile(
    envFile,
    envContent.replace(
      'ENCRYPT_KEY=',
      `ENCRYPT_KEY=${randomBytes(16).toString('hex')}`,
    ),
  );

  logInfo('√ Configured', true);

  logProgress('- Installing packages...');

  process.chdir(appName);

  if (!runCommand(`${manager.value} install`, true)) {
    logError('× Packages not installed', true);

    throw `Manager ${
      manager.value ?? 'npm'
    } not installed or package downloading failed`;
  }

  logInfo('√ Packages installed', true);

  switch (framework.value) {
    case 'react': {
      logProgress('- Installing React...');

      await mkdir(`${cwd}/${appName}/client`);

      await unlink(`${cwd}/${appName}/src/app/views/home.north.html`);

      await publishStub(`${cwd}/${appName}/client/package.json`, 'package');
      await publishStub(`${cwd}/${appName}/client/vite.config.js`, 'react/vite');
      await publishStub(`${cwd}/${appName}/client/react/main.js`, 'react/main');
      await publishStub(`${cwd}/${appName}/client/react/App.js`, 'react/component');
      await publishStub(
        `${cwd}/${appName}/src/app/views/home.north.html`,
        'react/home',
      );

      process.chdir('client');

      if (
        !runCommand(
          `${manager.value} ${
            manager.value === 'yarn' ? 'add' : 'install'
          } -D react react-dom vite @vitejs/plugin-react`,
        )
      ) {
        throw `Manager ${
          manager.value ?? 'npm'
        } not installed or package downloading failed`;
      }

      logInfo('√ React installed', true);

      break;
    }

    case 'vue': {
      logProgress('- Installing Vue...');

      await mkdir(`${cwd}/${appName}/client`);

      await unlink(`${cwd}/${appName}/src/app/views/home.north.html`);

      await publishStub(`${cwd}/${appName}/client/package.json`, 'package');
      await publishStub(`${cwd}/${appName}/client/vite.config.js`, 'vue/vite');
      await publishStub(`${cwd}/${appName}/client/vue/main.js`, 'vue/main');
      await publishStub(`${cwd}/${appName}/client/vue/App.vue`, 'vue/component');
      await publishStub(
        `${cwd}/${appName}/src/app/views/home.north.html`,
        'vue/home',
      );

      process.chdir('client');

      if (
        !runCommand(
          `${manager.value} ${
            manager.value === 'yarn' ? 'add' : 'install'
          } -D vue vite @vitejs/plugin-vue`,
        )
      ) {
        throw `Manager ${
          manager.value ?? 'npm'
        } not installed or package downloading failed`;
      }

      logInfo('√ Vue installed', true);

      break;
    }
  }

  setTimeout(() => {
    logInfo(
      `\nProject ${appName} has been created ${chalk.gray(
        `[run ${chalk.white('cd ' + appName + chalk.gray(' and ') + 'npm start')} to launch your app]`,
      )}`,
    );
  }, 900);
} catch (error) {
  logError(`\nInstallation failed. ${error}`);

  const appDirectory = `${cwd}/${appName}`;

  if (existsSync(appDirectory)) {
    await rm(appDirectory, {
      recursive: true,
    });
  }

  process.exit(1);
}
