import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

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

  @ApiPropertyOptional({ 
    description: 'Startdatum für die Abfrage (ISO-Format). Standard: vor 30 Tagen.', 
    example: '2024-03-01T00:00:00Z' 
  })
  @IsOptional()
  @IsDateString() // Validiert, dass es ein echtes Datum ist
  startDate?: string;
}