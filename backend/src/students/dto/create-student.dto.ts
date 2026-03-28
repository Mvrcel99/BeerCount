import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ 
    description: 'Vollständiger Name des Studenten', 
    example: 'Max Mustermann' 
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Optionaler Kurs oder Studiengang', 
    example: 'WWI24a', 
  })
  @IsOptional()
  @IsString()
  kurs: string;
}