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
  'https://github.com/northle/project-template/archive/refs/heads/main.zip';

const cwd = process.cwd();
const zipPath = `${cwd}/northle.zip`;

const appName =
  process.argv[2] ??
  (
    await prompt({
      type: 'text',
      name: 'value',
      message: 'What is the name of your app?',
      format: (value) => value.replaceAll(' ', '-'),
      validate: (value: string) =>
        /^[a-zA-Z0-9$@ _-]+$/.test(value)
          ? true
          : 'App name cannot contain special characters',
    })
  ).value;

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
    { title: 'Svelte', value: 'svelte' },
    { title: 'Leave me alone!', value: null },
  ],
  initial: 3,
});

try {
  logProgress('- Downloading files...');

  await download(repositoryUrl, cwd, {
    filename: 'northle.zip',
  });

  logInfo('√ Files downloaded', true);
  logProgress('- Extracting files...');

  await extractZip(zipPath, {
    dir: cwd,
  });

  await unlink(zipPath);

  logInfo('√ Files extracted', true);
  logProgress('- Initializing project...');

  await rename(`${cwd}/northle-main`, appName);

  await rm(`${cwd}/${appName}/.github`, {
    recursive: true,
  });

  const packagePath = `${cwd}/${appName}/package.json`;
  const packageData = JSON.parse((await readFile(packagePath)).toString());

  packageData.name = appName;

  if (framework.value) {
    packageData.scripts['start:vite'] =
      'concurrently -r "cd client && npm run dev" "northle start:dev"';
  }

  await writeFile(packagePath, JSON.stringify(packageData, null, 2) + '\n');

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

  const managerError = `${
    manager.value ?? 'npm'
  } not installed or package downloading failed`;

  if (!runCommand(`${manager.value} install`, true)) {
    logError('× Packages not installed', true);

    throw managerError;
  }

  if (framework.value) {
    if (!runCommand('npm install -D concurrently', true)) {
      logError('× Packages not installed', true);

      throw managerError;
    }
  }

  logInfo('√ Packages installed', true);

  if (framework.value) {
    await mkdir(`${cwd}/${appName}/client`);
    await unlink(`${cwd}/${appName}/src/app/views/home.north.html`);
    await publishStub(`${cwd}/${appName}/client/package.json`, 'package');

    process.chdir('client');
  }

  switch (framework.value) {
    case 'react': {
      logProgress('- Installing React...');

      await publishStub(`${cwd}/${appName}/client/vite.config.js`, 'app/vite');
      await publishStub(`${cwd}/${appName}/client/app/main.jsx`, 'app/main');
      await publishStub(`${cwd}/${appName}/client/app/App.jsx`, 'app/component');
      await publishStub(
        `${cwd}/${appName}/src/app/views/home.north.html`,
        'app/home',
      );

      if (
        !runCommand(
          `${manager.value} ${
            manager.value === 'yarn' ? 'add' : 'install'
          } -D react react-dom vite @vitejs/plugin-react`,
        )
      ) {
        logError('× React not installed', true);

        throw managerError;
      }

      logInfo('√ React installed', true);

      break;
    }

    case 'vue': {
      logProgress('- Installing Vue...');

      await publishStub(`${cwd}/${appName}/client/vite.config.js`, 'app/vite');
      await publishStub(`${cwd}/${appName}/client/app/main.js`, 'app/main');
      await publishStub(`${cwd}/${appName}/client/app/App.vue`, 'app/component');
      await publishStub(
        `${cwd}/${appName}/src/app/views/home.north.html`,
        'app/home',
      );

      if (
        !runCommand(
          `${manager.value} ${
            manager.value === 'yarn' ? 'add' : 'install'
          } -D vue vite @vitejs/plugin-vue`,
        )
      ) {
        logError('× Vue not installed', true);

        throw managerError;
      }

      logInfo('√ Vue installed', true);

      break;
    }

    case 'svelte': {
      logProgress('- Installing Svelte...');

      await publishStub(`${cwd}/${appName}/client/vite.config.js`, 'app/vite');
      await publishStub(`${cwd}/${appName}/client/app/main.js`, 'app/main');
      await publishStub(
        `${cwd}/${appName}/client/app/App.svelte`,
        'app/component',
      );
      await publishStub(
        `${cwd}/${appName}/src/app/views/home.north.html`,
        'app/home',
      );

      if (
        !runCommand(
          `${manager.value} ${
            manager.value === 'yarn' ? 'add' : 'install'
          } -D svelte vite @sveltejs/vite-plugin-svelte`,
        )
      ) {
        logError('× Svelte not installed', true);

        throw managerError;
      }

      logInfo('√ Svelte installed', true);

      break;
    }
  }

  setTimeout(() => {
    logInfo(
      `\nProject ${appName} has been created ${chalk.gray(
        `[run ${chalk.white(
          `cd ${appName} ${chalk.gray('and')} ${
            framework.value ? 'npm run start:vite' : 'npm start'
          }`,
        )} to launch your app]`,
      )}`,
    );
  }, 800);
} catch (error) {
  logError(`\nInstallation failed ${chalk.gray(`[${error}]`)}`);

  const appDirectory = `${cwd}/${appName}`;

  if (existsSync(appDirectory)) {
    await rm(appDirectory, {
      recursive: true,
    });
  }

  process.exit(1);
}
