import chalk from 'chalk';
import { clearLine } from './clear-line.function';

export function logInfo(data: string, clear = false) {
  if (clear) {
    clearLine();
  }

  console.log(
    `${
      data.charAt(0) === '√'
        ? chalk.green(data.charAt(0)) + chalk.bold.green(data.slice(1))
        : chalk.bold.green(data)
    }`,
  );
}
