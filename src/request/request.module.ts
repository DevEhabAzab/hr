import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { Request } from './entities/request.entity';
import { RequestType } from './entities/request-type.entity';
import { Employee } from '../employee/entities/employee.entity';
import { EmployeeBalance } from '../balance/entities/employee-balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Request, RequestType, Employee, EmployeeBalance])],
  providers: [RequestService],
  controllers: [RequestController],
  exports: [RequestService],
})
export class RequestModule {}