export function clearLine() {
  process.stdout.moveCursor(0, -1);
  process.stdout.clearLine(1);
}
