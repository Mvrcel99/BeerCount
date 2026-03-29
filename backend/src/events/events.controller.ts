import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, EventType } from './dto/create-event.dto';
import { CreateMinusDto } from './dto/create-minus.dto';
import { CreateCorrectionDto } from './dto/create-correction.dto';
import { GetEventsQueryDto } from './dto/get-events-query.dto';
import { AggregateWindow, GetAggregatedQueryDto } from './dto/get-aggregated-query.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Events (Bier-Tracking)')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  // DEV

  @Post('dev') // Nur für Entwicklungszwecke, um Events zu erstellen
  @Roles(Role.ADMIN)
  createEventDev() {
    return this.eventsService.seedTestData();
  }
  // US 1 (Student) US 3 (Begründung)
  @Post()
  @Roles(Role.ADMIN, Role.STUDENT, Role.KURSSPRECHER)
  createEvent(@Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(dto);
  }

  // US 2 (Kurssprecher)
  @Post('minus')
  @Roles(Role.ADMIN, Role.KURSSPRECHER)
  createMinus(@Body() dto: CreateMinusDto) {
    return this.eventsService.createEvent({
      studentId: dto.studentId,
      vorlesung: 'Bier-Ausgabe',
      begruendung: dto.begruendung,
      typ: EventType.MINUS,
    });
  }

  // US 8 (Admin)
  @Post('correct')
  @Roles(Role.ADMIN)
  createCorrection(@Body() dto: CreateCorrectionDto) {
    return this.eventsService.createCorrection(
      dto.studentId,
      dto.begruendung,
      dto.anzahl,
    );
  }

  // US 7 (Student) Historie
  @Get()
  @Roles(Role.ADMIN, Role.STUDENT, Role.KURSSPRECHER)
  getEvents(@Query() query: GetEventsQueryDto) {
    return this.eventsService.getEvents(query.studentId);
  }

  // US 9 (Student) Zeitraum-Aggregation
  @Get('aggregate')
  @Roles(Role.ADMIN, Role.STUDENT, Role.KURSSPRECHER)
  getAggregated(@Query() query: GetAggregatedQueryDto) {
    return this.eventsService.getAggregated(query.window || AggregateWindow.WEEK, query.startDate);
  }
}