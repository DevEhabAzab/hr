import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { Employee } from './entities/employee.entity';
import { Department } from '../department/entities/department.entity';
import { EmployeeBalance } from '../balance/entities/employee-balance.entity';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Department, EmployeeBalance])],
  providers: [EmployeeService, AuthService, JwtService],
  controllers: [EmployeeController],
  exports: [EmployeeService],
})
export class EmployeeModule {}