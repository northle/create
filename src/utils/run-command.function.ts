import { execSync } from 'node:child_process';

export const runCommand = (command: string, showOutput = false) => {
  try {
    execSync(command, {
      stdio: showOutput ? 'inherit' : 'pipe',
    });

    return true;
  } catch (error) {
    return false;
  }
};
