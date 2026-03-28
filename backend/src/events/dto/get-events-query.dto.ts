import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GetEventsQueryDto {
  @ApiPropertyOptional({ description: 'Filtere Historie nach Studenten-ID' })
  @IsOptional()
  @IsString()
  studentId?: string;
}