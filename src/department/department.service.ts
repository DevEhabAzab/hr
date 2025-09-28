import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const existingDepartment = await this.departmentRepository.findOne({
      where: { name: createDepartmentDto.name },
    });

    if (existingDepartment) {
      throw new BadRequestException('Department name already exists');
    }

    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find({
      relations: ['employees'],
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        employees: { id: true, firstName: true, lastName: true, employeeCode: true },
      },
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['employees'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existingDepartment = await this.departmentRepository.findOne({
        where: { name: updateDepartmentDto.name },
      });
      if (existingDepartment) {
        throw new BadRequestException('Department name already exists');
      }
    }

    await this.departmentRepository.update(id, updateDepartmentDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['employees'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (department.employees && department.employees.length > 0) {
      throw new BadRequestException('Cannot delete department with employees');
    }

    await this.departmentRepository.delete(id);
  }
}