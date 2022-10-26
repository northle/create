import { execSync } from 'node:child_process';

interface Options {
  showOutput?: boolean;
}

export const runCommand = (command: string, options?: Options) => {
  try {
    execSync(command, {
      stdio: options?.showOutput ?? false ? 'inherit' : 'pipe',
    });

    return true;
  } catch (error) {
    return false;
  }
};
