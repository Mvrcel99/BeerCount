import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMinusDto {
  @ApiProperty({ description: 'ID des Studenten (Kurssprecher)', example: 'std-456' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Begründung für die Bier-Ausgabe', example: 'Semesterabschluss' })
  @IsString()
  @IsNotEmpty()
  begruendung: string;
}