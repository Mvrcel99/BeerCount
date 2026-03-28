import { Injectable, NotFoundException } from '@nestjs/common';
import { Point } from '@influxdata/influxdb-client';
import { v4 as uuidv4 } from 'uuid';
import { InfluxDbService } from '../influxdb/influxdb.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly influx: InfluxDbService) {}

  async createStudent(dto: CreateStudentDto) {
    const studentId = uuidv4();
    const writeApi = this.influx.getWriteApi();

    const point = new Point('student')
      .tag('studentId', studentId)  
      .stringField('name', dto.name)
      .tag('kurs', dto.kurs); 

    writeApi.writePoint(point);
    await writeApi.close();

    return { studentId, name: dto.name, kurs: dto.kurs };
  }

  async getAllStudents(): Promise<{ studentId: string; name: string; kurs: string }[]> {
    const queryApi = this.influx.getQueryApi();

    // Für jeden Student nur den neuesten Eintrag holen (last())
    const query = `
      from(bucket: "${this.influx.bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => r._measurement == "student" and r._field == "name")
        |> last()
        |> group()
    `;

    const results: { studentId: string; name: string; kurs: string }[] = [];
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          results.push({ studentId: obj.studentId, name: obj._value, kurs: obj.kurs });
        },
        error: reject,
        complete: resolve,
      });
    });

    return results;
  }

  async getStudentById(id: string): Promise<{ studentId: string; name: string; kurs: string }> {
    const students = await this.getAllStudents();
    const student = students.find((s) => s.studentId === id);
    if (!student) throw new NotFoundException(`Student ${id} nicht gefunden`);
    return student;
  }

  async getBalances(): Promise<{ studentId: string; name: string; striche: number }[]> {
    const queryApi = this.influx.getQueryApi();

    // Kontostand = Summe aller anzahl-Fields pro studentId
    const query = `
      from(bucket: "${this.influx.bucket}")
        |> range(start: 0)
        |> filter(fn: (r) => r._measurement == "bier_event" and r._field == "anzahl")
        |> group(columns: ["studentId"])
        |> sum(column: "_value")
    `;

    const balanceMap = new Map<string, number>();
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          balanceMap.set(obj.studentId, obj._value ?? 0);
        },
        error: reject,
        complete: resolve,
      });
    });

    const students = await this.getAllStudents();

    return students.map((s) => ({
      studentId: s.studentId,
      name: s.name,
      kurs: s.kurs,
      striche: balanceMap.get(s.studentId) ?? 0,
    }));
  }
}
