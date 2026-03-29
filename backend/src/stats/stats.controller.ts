import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AccessGuard } from '../common/guards/access/access.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Roles(Role.ADMIN, Role.STUDENT, Role.KURSSPRECHER)
@UseGuards(AccessGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) { }

  // US 6 – Zeitverlauf der Schulden
  @Get('timeline')
  getTimeline(@Query('studentId') studentId?: string) {
    return this.statsService.getTimeline(studentId);
  }

  // US 10 – Wochendurchschnitt pro Person
  @Get('weekly-avg')
  getWeeklyAvg() {
    return this.statsService.getWeeklyAvg();
  }

  // US 4 – Rangliste
  @Get('leaderboard')
  getLeaderboard() {
    return this.statsService.getLeaderboard();
  }

  // US 9 – Zeitraum-Filter
  @Get('by-period')
  getByPeriod(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.statsService.getByPeriod(start, end);
  }
}
