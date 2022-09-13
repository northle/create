import chalk from 'chalk';
import { clearLine } from './clear-line.function';

export const logInfo = (data: string) => {
  clearLine();

  console.log(`${chalk.bold.green(data)}`);
};
