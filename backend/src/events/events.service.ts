import { BadRequestException, Injectable } from '@nestjs/common';
import { Point } from '@influxdata/influxdb-client';
import { InfluxDbService } from '../influxdb/influxdb.service';
import { CreateEventDto, EventType } from './dto/create-event.dto'; // <-- EventType importieren
import { AggregateWindow } from './dto/get-aggregated-query.dto'; // <-- AggregateWindow importieren
import { StudentsService } from '../students/students.service';

@Injectable()
export class EventsService {
  constructor(private readonly influx: InfluxDbService,
    private readonly studentsService: StudentsService
  ) {}

  async createEvent(dto: CreateEventDto) {
    const student = await this.studentsService.getStudentById(dto.studentId);
    if(!student) {
      throw new BadRequestException(`Student mit ID ${dto.studentId} existiert nicht`);
    }

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
    const student = await this.studentsService.getStudentById(studentId);
    if(!student) {
      throw new BadRequestException(`Student mit ID ${studentId} existiert nicht`);
    }
    
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
    if (studentId) {    
      const student = await this.studentsService.getStudentById(studentId);
      if(!student) {
        throw new BadRequestException(`Student mit ID ${studentId} existiert nicht`);
      }
    }
    
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

async getAggregated(window: AggregateWindow, startDate?: string): Promise<any[]> {
    const queryApi = this.influx.getQueryApi();

    if (startDate && new Date(startDate) > new Date()) {
      throw new BadRequestException('Startdatum darf nicht in der Zukunft liegen');
    }

    const windowMap = {
      [AggregateWindow.DAY]: '1d',
      [AggregateWindow.WEEK]: '1w',
      [AggregateWindow.MONTH]: '1mo'
    };
    const every = windowMap[window];
    
    const startRange = startDate ? `time(v: "${startDate}")` : '-30d';

    const query = `
      from(bucket: "${this.influx.bucket}")
        |> range(start: ${startRange})
        |> filter(fn: (r) => r._measurement == "bier_event" and r._field == "anzahl")
        |> group(columns: ["studentId"])
        |> aggregateWindow(every: ${every}, fn: sum, createEmpty: false, timeSrc: "_start")
    `;

    const results: any[] = [];
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          results.push({
            studentId: obj.studentId,
            window: obj._time, // _time sollte jetzt das korrekte Datum des Fensters enthalten
            summe: obj._value,
          });
        },
        error: reject,
        complete: resolve,
      });
    });

    return results;
  }

// DEV: Testdaten in InfluxDB einfügen
async seedTestData() {
  const writeApi = this.influx.getWriteApi();
  const students = await this.studentsService.getAllStudents().then(s => s.map(stu => stu.studentId));
  if(students.length === 0) {
    throw new BadRequestException('Keine Studenten gefunden. Bitte zuerst Studenten anlegen.');
  }
  const vorlesungen = ['Web-Engineering', 'Datenbanken', 'Mathe'];
  
  // Wir erstellen 20 Events verteilt über die letzten 30 Tage
  for (let i = 0; i < 20; i++) {
    const eventDate = new Date();
    // Zufällige Verteilung: Gehe i Tage zurück
    eventDate.setDate(eventDate.getDate() - i); 
    
    const point = new Point('bier_event')
      .tag('studentId', students[i % 2]) // Abwechselnd
      .tag('vorlesung', vorlesungen[i % 3])
      .tag('typ', 'plus')
      .stringField('begruendung', `Automatischer Testeintrag #${i}`)
      .intField('anzahl', 1)
      .timestamp(eventDate); // <--- Das setzt das Datum in die Vergangenheit!

    writeApi.writePoint(point);
  }

  await writeApi.close();
  return { message: '20 Test-Events erfolgreich generiert!' };
}
}