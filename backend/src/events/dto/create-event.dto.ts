import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum EventType {
  PLUS = 'plus',
  MINUS = 'minus',
  CORRECTION = 'correction',
}

export class CreateEventDto {
  @ApiProperty({ description: 'ID des Studenten', example: '1' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Name der Vorlesung', example: 'Mathematik 1' })
  @IsString()
  @IsNotEmpty()
  vorlesung: string;

  @ApiProperty({ description: 'Begründung für die Störung', example: 'Handy hat geklingelt' })
  @IsString()
  @IsNotEmpty()
  begruendung: string;

  @ApiPropertyOptional({ enum: EventType, description: 'Art des Events (Standard: plus)' })
  @IsOptional()
  @IsEnum(EventType)
  typ?: EventType;
}