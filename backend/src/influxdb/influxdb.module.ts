import { Global, Module } from '@nestjs/common';
import { InfluxDbService } from './influxdb.service';

@Global()
@Module({
  providers: [InfluxDbService],
  exports: [InfluxDbService], 
})
export class InfluxDbModule {}