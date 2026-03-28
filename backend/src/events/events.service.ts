import { Injectable } from '@nestjs/common';
import { Point } from '@influxdata/influxdb-client';
import { InfluxDbService } from '../influxdb/influxdb.service';
import { CreateEventDto, EventType } from './dto/create-event.dto'; // <-- EventType importieren
import { AggregateWindow } from './dto/get-aggregated-query.dto'; // <-- AggregateWindow importieren

@Injectable()
export class EventsService {
  constructor(private readonly influx: InfluxDbService) {}

  async createEvent(dto: CreateEventDto) {
    const writeApi = this.influx.getWriteApi();
    
    const eventTyp = dto.typ || EventType.PLUS; 
    const anzahl = eventTyp === EventType.PLUS ? 1 : -1;

    const point = new Point('bier_event')
      .tag('studentId', dto.studentId)
      .tag('vorlesung', dto.vorlesung)
      .tag('typ', eventTyp) 
      .stringField('begruendung', dto.begruendung)
      .intField('anzahl', anzahl);

    writeApi.writePoint(point);
    await writeApi.close();

    return { message: 'Event gespeichert', timestamp: new Date().toISOString() };
  }

  async createCorrection(studentId: string, begruendung: string, anzahl: number) {
    const writeApi = this.influx.getWriteApi();

    const point = new Point('bier_event')
      .tag('studentId', studentId)
      .tag('vorlesung', 'Korrektur')
      .tag('typ', 'korrektur')
      .stringField('begruendung', begruendung)
      .intField('anzahl', anzahl);

    writeApi.writePoint(point);
    await writeApi.close();

    return { message: 'Korrektur gespeichert' };
  }

  async getEvents(studentId?: string): Promise<any[]> {
    const queryApi = this.influx.getQueryApi();

    const filter = studentId
      ? `|> filter(fn: (r) => r["studentId"] == "${studentId}")`
      : '';

    const query = `
      from(bucket: "${this.influx.bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => r._measurement == "bier_event")
        ${filter}
        |> pivot(rowKey: ["_time", "studentId", "vorlesung", "typ"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"], desc: true)
    `;

    const results: any[] = [];
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          results.push({
            timestamp: obj._time,
            studentId: obj.studentId,
            vorlesung: obj.vorlesung,
            typ: obj.typ,
            begruendung: obj.begruendung,
            anzahl: obj.anzahl,
          });
        },
        error: reject,
        complete: resolve,
      });
    });

    return results;
  }

  async getAggregated(window: AggregateWindow): Promise<any[]> {
    const queryApi = this.influx.getQueryApi();

    const windowMap = {
      [AggregateWindow.DAY]: '1d',
      [AggregateWindow.WEEK]: '1w',
      [AggregateWindow.MONTH]: '1mo'
    };
    const every = windowMap[window];

    const query = `
      from(bucket: "${this.influx.bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => r._measurement == "bier_event" and r._field == "anzahl")
        |> aggregateWindow(every: ${every}, fn: sum, createEmpty: false)
        |> group(columns: ["studentId", "_start"])
        |> sum(column: "_value")
    `;

    const results: any[] = [];
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          results.push({
            studentId: obj.studentId,
            window: obj._start,
            summe: obj._value,
          });
        },
        error: reject,
        complete: resolve,
      });
    });

    return results;
  }
}