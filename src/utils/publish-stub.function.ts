import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { makeFile } from './make-file.function';

export async function publishStub(file: string, stub: string) {
  try {
    const path = `${fileURLToPath(import.meta.url)}/../../../stubs/${stub}.stub`;
    const content = (await readFile(path)).toString();

    makeFile(file, content);

    return true;
  } catch {
    return false;
  }
}
