import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export const makeFile = async (path: string, content: string) => {
  if (!existsSync(path)) {
    await mkdir(dirname(path), {
      recursive: true,
    });
  } else {
    return false;
  }

  try {
    await writeFile(path, content);

    return true;
  } catch (error) {
    return false;
  }
};
