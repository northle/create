import { Controller, Request, Response, Route, view } from '@norther/core';

@Controller()
export class AppController {
  constructor(private request: Request, private response: Response) {}

  @Route.Get('/')
  public index() {
    return view('./views/home', {
      message: 'Hello Norther!',
    });
  }
}
