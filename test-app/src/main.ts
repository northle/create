import { createServer } from '@norther/core';
import { AppModule } from './app/app.module';

const server = createServer({
  config: {
    dev: {
      openBrowser: true,
    },
  },
  modules: [
    AppModule,
  ],
});

await server.start();
