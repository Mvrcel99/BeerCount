import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum AggregateWindow {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class GetAggregatedQueryDto {
  @ApiPropertyOptional({ enum: AggregateWindow, default: AggregateWindow.WEEK, description: 'Zeitraum für die Aggregation' })
  @IsOptional()
  @IsEnum(AggregateWindow)
  window?: AggregateWindow = AggregateWindow.WEEK;
}