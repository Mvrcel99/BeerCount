import { Injectable } from '@nestjs/common';
import { InfluxDbService } from '../influxdb/influxdb.service';
import { StudentsService } from '../students/students.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly influx: InfluxDbService,
    private readonly students: StudentsService,
  ) {}

  // US 6 – Zeitverlauf der kumulativen Schulden pro Student
  async getTimeline(studentId?: string): Promise<any[]> {
    const queryApi = this.influx.getQueryApi();

    const filter = studentId
      ? `|> filter(fn: (r) => r["studentId"] == "${studentId}")`
      : '';

    const query = `
      from(bucket: "${this.influx.bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => r._measurement == "bier_event" and r._field == "anzahl")
        ${filter}
        |> group(columns: ["studentId"])
        |> cumulativeSum(columns: ["_value"])
    `;

    const results: any[] = [];
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          results.push({
            timestamp: obj._time,
            studentId: obj.studentId,
            kumulativ: obj._value,
          });
        },
        error: reject,
        complete: resolve,
      });
    });

    return results;
  }

  // US 10 – Durchschnitt pro Person pro Woche
  async getWeeklyAvg(): Promise<any[]> {
    const queryApi = this.influx.getQueryApi();

    const query = `
      weeklyTotals = from(bucket: "${this.influx.bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => r._measurement == "bier_event" and r._field == "anzahl")
        |> aggregateWindow(every: 1w, fn: sum, createEmpty: false)
        |> group(columns: ["studentId"])

      weeklyTotals
        |> mean(column: "_value")
    `;

    const results: any[] = [];
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          results.push({
            studentId: obj.studentId,
            avgProWoche: Math.round((obj._value ?? 0) * 100) / 100,
          });
        },
        error: reject,
        complete: resolve,
      });
    });

    // Namen ergänzen
    const students = await this.students.getAllStudents();
    const nameMap = new Map(students.map((s) => [s.studentId, s.name]));

    return results.map((r) => ({
      ...r,
      name: nameMap.get(r.studentId) ?? 'Unbekannt',
    }));
  }

  // US 4 – Rangliste nach Gesamtstrichen
  async getLeaderboard(): Promise<any[]> {
    const balances = await this.students.getBalances();
    return balances
      .sort((a, b) => b.striche - a.striche)
      .map((s, i) => ({ rank: i + 1, ...s }));
  }

  // US 9 – Auswertung für beliebigen Zeitraum
  async getByPeriod(start: string, end: string): Promise<any[]> {
    const queryApi = this.influx.getQueryApi();

    const query = `
      from(bucket: "${this.influx.bucket}")
        |> range(start: ${start}, stop: ${end})
        |> filter(fn: (r) => r._measurement == "bier_event" and r._field == "anzahl")
        |> group(columns: ["studentId"])
        |> sum(column: "_value")
    `;

    const results: any[] = [];
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          results.push({
            studentId: obj.studentId,
            striche: obj._value ?? 0,
          });
        },
        error: reject,
        complete: resolve,
      });
    });

    const students = await this.students.getAllStudents();
    const nameMap = new Map(students.map((s) => [s.studentId, s.name]));

    return results.map((r) => ({
      ...r,
      name: nameMap.get(r.studentId) ?? 'Unbekannt',
    }));
  }
}
