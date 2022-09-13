import { describe, expect, it } from 'vitest';
import { inject } from '@norther/core';
import { AppController } from './app.controller';

describe('app module', () => {
  it('has working controller', () => {
    const controller = inject(AppController);
    const result = controller.index();

    expect(result).toContain('Hello');
  });
});
