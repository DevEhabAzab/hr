import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HrGuard } from '../auth/guards/hr.guard';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @UseGuards(HrGuard)
  @ApiOperation({ summary: 'Create new employee (HR only)' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @UseGuards(HrGuard)
  @ApiOperation({ summary: 'Get all employees (HR only)' })
  @ApiResponse({ status: 200, description: 'List of all employees' })
  findAll() {
    return this.employeeService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  getProfile(@Request() req) {
    return this.employeeService.getProfile(req.user.userId);
  }

  @Get('subordinates')
  @ApiOperation({ summary: 'Get employees reporting to current user' })
  @ApiResponse({ status: 200, description: 'List of subordinates' })
  getSubordinates(@Request() req) {
    return this.employeeService.findSubordinates(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(HrGuard)
  @ApiOperation({ summary: 'Update employee (HR only)' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @UseGuards(HrGuard)
  @ApiOperation({ summary: 'Deactivate employee (HR only)' })
  @ApiResponse({ status: 200, description: 'Employee deactivated successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.remove(id);
  }
}
