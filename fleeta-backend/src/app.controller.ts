import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getAPI(@Req() request: Request): string {
    return 'Fleeta Backend is working!';
  }
}
