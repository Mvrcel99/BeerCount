import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InfluxDbService } from './influxdb/influxdb.service'; // WICHTIG: Unseren neuen Service importieren

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly influx: InfluxDbService, // Hier binden wir InfluxDB ein
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async health() {
    try {
      const queryApi = this.influx.getQueryApi();
      
      // Eine korrekte Flux-Query, die eine Tabelle (Stream) generiert
      const query = `
        import "array"
        array.from(rows: [{status: "ok"}])
      `; 
      await queryApi.collectRows(query);

      return { ok: true, database: 'InfluxDB is connected and running! 🍻' };
    } catch (error) {
      return { ok: false, database: 'InfluxDB is NOT reachable', error: error.message };
    }
  }
}