import chalk from 'chalk';
import { clearLine } from './clear-line.function';

export function logProgress(data: string, clear = false) {
  if (clear) {
    clearLine();
  }

  console.log(
    `${
      data.charAt(0) === '√'
        ? chalk.gray(data.charAt(0)) + chalk.bold.gray(data.slice(1))
        : chalk.bold.gray(data)
    }`,
  );
}
