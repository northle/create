import { readFile } from 'node:fs/promises';
import { makeFile } from './make-file.function';
import { fileURLToPath } from 'node:url';

export const publishStub = async (file: string, stub: string, variables: Record<string, any> = {}) => {
  const variablePattern = /\{(@?)(.*?)\}/g;

  try {
    const path = `${fileURLToPath(import.meta.url)}/../../stubs/${stub}.stub`;

    let content = (await readFile(path)).toString();

    for (const expression of content.matchAll(variablePattern) ?? []) {
      const variableValue = variables[expression[2]];

      content = content.replace(expression[0], variableValue);
    }

    makeFile(file, content);

    return true;
  } catch (error) {
    return false;
  }
};
