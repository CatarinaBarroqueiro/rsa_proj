import { Module } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { RealtimeController } from './realtime.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealTime } from './realtime.entity';
import { AppService } from 'src/app.service';

@Module({
  imports: [TypeOrmModule.forFeature([RealTime])],
  providers: [RealtimeService, AppService],
  controllers: [RealtimeController],
  exports:[RealtimeService]
})
export class RealtimeModule {}
