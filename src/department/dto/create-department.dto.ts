import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Human Resources' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'HR Department managing employee relations', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}