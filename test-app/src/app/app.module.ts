import { Module } from '@norther/core';
import { AppController } from './app.controller';

@Module({
  controllers: [
    AppController,
  ],
  channels: [],
})
export class AppModule {
  constructor() {}
}
