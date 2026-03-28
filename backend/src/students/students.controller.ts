import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AccessGuard } from '../common/guards/access/access.guard';
import { CreateStudentDto } from './dto/create-student.dto';

@UseGuards(AccessGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // US 5 – Student anlegen (Admin)
  @Post()
  createStudent(@Body() dto: CreateStudentDto) {
    return this.studentsService.createStudent(dto);
  }

  // US 4 – Alle Studenten auflisten
  @Get()
  getAllStudents() {
    return this.studentsService.getAllStudents();
  }

  // US 4 – Live-Kontostand aller Teilnehmer
  @Get('balance')
  getBalances() {
    return this.studentsService.getBalances();
  }

  // US 7 – Einzelprofil
  @Get(':id')
  getStudentById(@Param('id') id: string) {
    return this.studentsService.getStudentById(id);
  }
}
