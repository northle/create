import chalk from 'chalk';
import { clearLine } from './clear-line.function';

export function logError(data: string, clear = false) {
  if (clear) {
    clearLine();
  }

  console.error(`${chalk.bold.redBright(data)}`);
}
