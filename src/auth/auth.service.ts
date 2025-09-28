
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from '../employee/entities/employee.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const employee = await this.employeeRepository.findOne({
      where: { email, isActive: true },
      relations: ['department', 'manager'],
    });

    if (employee && await bcrypt.compare(password, employee.passwordHash)) {
      const { passwordHash, ...result } = employee;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const employee = await this.validateUser(loginDto.email, loginDto.password);
    if (!employee) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: employee.email,
      sub: employee.id,
      isHr: employee.isHr,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: employee,
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}