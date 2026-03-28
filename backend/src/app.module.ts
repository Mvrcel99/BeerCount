import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfluxDbModule } from './influxdb/influxdb.module';
import { InfluxDbService } from './influxdb/influxdb.service';
import { EventsModule } from './events/events.module';




@Module({
  imports: [InfluxDbModule, EventsModule],
  controllers: [AppController],
  providers: [AppService, InfluxDbService],
})
export class AppModule {}
