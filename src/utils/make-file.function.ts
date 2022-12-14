import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function makeFile(path: string, content: string) {
  if (!existsSync(path)) {
    await mkdir(dirname(path), {
      recursive: true,
    });
  } else {
    return false;
  }

  try {
    await writeFile(path, content, 'utf8');

    return true;
  } catch {
    return false;
  }
}
