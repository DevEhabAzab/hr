import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { Department } from '../department/entities/department.entity';
import { EmployeeBalance } from '../balance/entities/employee-balance.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(EmployeeBalance)
    private balanceRepository: Repository<EmployeeBalance>,
    private authService: AuthService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Check if employee code or email already exists
    const existingEmployee = await this.employeeRepository.findOne({
      where: [
        { employeeCode: createEmployeeDto.employeeCode },
        { email: createEmployeeDto.email },
      ],
    });

    if (existingEmployee) {
      throw new BadRequestException('Employee code or email already exists');
    }

    // Verify department exists
    if (createEmployeeDto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: createEmployeeDto.departmentId },
      });
      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    // Verify manager exists
    if (createEmployeeDto.managerId) {
      const manager = await this.employeeRepository.findOne({
        where: { id: createEmployeeDto.managerId, isActive: true },
      });
      if (!manager) {
        throw new NotFoundException('Manager not found');
      }
    }

    // Hash password
    const passwordHash = await this.authService.hashPassword(createEmployeeDto.password);

     const employee = this.employeeRepository.create({
    ...createEmployeeDto,
  });

  employee.passwordHash=passwordHash;
  employee.department=createEmployeeDto.departmentId
      ? ({ id: createEmployeeDto.departmentId } as Department)
      : null;

  employee.manager= createEmployeeDto.managerId
      ? ({ id: createEmployeeDto.managerId } as Employee)
      : null;
   
    const savedEmployee = await this.employeeRepository.save(employee);

    // Create initial balance for current year
    const currentYear = new Date().getFullYear();
    const balance = this.balanceRepository.create({
      employee: savedEmployee,
      year: currentYear,
    });
    await this.balanceRepository.save(balance);

    return this.findOne(savedEmployee.id);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      relations: ['department', 'manager'],
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        position: true,
        hireDate: true,
        isActive: true,
        isHr: true,
        department: { id: true, name: true },
        manager: { id: true, firstName: true, lastName: true },
      },
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['department', 'manager', 'subordinates'],
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        position: true,
        hireDate: true,
        salary: true,
        isActive: true,
        isHr: true,
        department: { id: true, name: true },
        manager: { id: true, firstName: true, lastName: true },
        subordinates: { id: true, firstName: true, lastName: true, employeeCode: true },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async findByEmail(email: string): Promise<Employee |null> {
   return this.employeeRepository.findOne({
      where: { email, isActive: true },
      relations: ['department', 'manager'],
    });
  
  }

  async findSubordinates(managerId: string): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: { manager: { id: managerId }, isActive: true },
      relations: ['department'],
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        department: { id: true, name: true },
      },
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    // Check if new email is unique (if changed)
    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmployee = await this.employeeRepository.findOne({
        where: { email: updateEmployeeDto.email },
      });
      if (existingEmployee) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Verify department exists
    if (updateEmployeeDto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: updateEmployeeDto.departmentId },
      });
      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    // Verify manager exists
    if (updateEmployeeDto.managerId) {
      const manager = await this.employeeRepository.findOne({
        where: { id: updateEmployeeDto.managerId, isActive: true },
      });
      if (!manager) {
        throw new NotFoundException('Manager not found');
      }
    }

    // Hash new password if provided
    if (updateEmployeeDto.password) {
      updateEmployeeDto['passwordHash'] = await this.authService.hashPassword(updateEmployeeDto.password);
      delete updateEmployeeDto.password;
    }

    await this.employeeRepository.update(id, {
      ...updateEmployeeDto,
      department: updateEmployeeDto.departmentId ? { id: updateEmployeeDto.departmentId } : undefined,
      manager: updateEmployeeDto.managerId ? { id: updateEmployeeDto.managerId } : undefined,
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeeRepository.update(id, { isActive: false });
  }

  async getProfile(userId: string): Promise<Employee> {
    return this.findOne(userId);
  }
}