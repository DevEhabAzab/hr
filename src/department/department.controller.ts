import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HrGuard } from '../auth/guards/hr.guard';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @UseGuards(HrGuard)
  @ApiOperation({ summary: 'Create new department (HR only)' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'List of all departments' })
  findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, description: 'Department details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(HrGuard)
  @ApiOperation({ summary: 'Update department (HR only)' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @UseGuards(HrGuard)
  @ApiOperation({ summary: 'Delete department (HR only)' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.remove(id);
  }
}