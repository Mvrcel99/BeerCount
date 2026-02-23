import { Injectable } from '@nestjs/common';
import { InfluxDB, WriteApi, QueryApi } from '@influxdata/influxdb-client';

@Injectable()
export class InfluxDbService {
  private readonly influxDB: InfluxDB;
  public readonly org: string;
  public readonly bucket: string;

  constructor() {
    this.org = process.env.INFLUX_ORG || 'dhbw';
    this.bucket = process.env.INFLUX_BUCKET || 'bier_events';
    
    this.influxDB = new InfluxDB({
      url: process.env.INFLUX_URL || 'http://localhost:8086',
      token: process.env.INFLUX_TOKEN,
    });
  }

  getWriteApi(): WriteApi {
    return this.influxDB.getWriteApi(this.org, this.bucket, 'ns');
  }

  getQueryApi(): QueryApi {
    return this.influxDB.getQueryApi(this.org);
  }
}