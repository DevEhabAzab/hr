import { IsString, IsEmail, IsOptional, IsBoolean, IsDateString, IsDecimal, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP001' })
  @IsString()
  employeeCode: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  hireDate: string;

  @ApiProperty({ example: 50000.00, required: false })
  @IsOptional()
  @IsDecimal()
  salary?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isHr?: boolean;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  managerId?: string;
}