import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateCorrectionDto {
  @ApiProperty({ description: 'ID des Studenten', example: 'std-123' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Begründung für die Korrektur', example: 'Doppelt eingetragen' })
  @IsString()
  @IsNotEmpty()
  begruendung: string;

  @ApiProperty({ description: 'Anzahl der zu korrigierenden Biere (kann positiv oder negativ sein)', example: -1 })
  @IsInt()
  @IsNotEmpty()
  anzahl: number;
}