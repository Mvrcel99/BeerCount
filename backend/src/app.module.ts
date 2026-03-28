import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfluxDbModule } from './influxdb/influxdb.module';
import { InfluxDbService } from './influxdb/influxdb.service';
import { EventsModule } from './events/events.module';
import { StudentsModule } from './students/students.module';
import { StatsModule } from './stats/stats.module';




@Module({
  imports: [InfluxDbModule, EventsModule, StudentsModule,StatsModule],
  controllers: [AppController],
  providers: [AppService, InfluxDbService],
})
export class AppModule {}
