import { Entity, Column, ManyToOne, JoinColumn, OneToMany, IsNull } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../common/entities/base.entity';
import { Department } from '../../department/entities/department.entity';
import { Request } from '../../request/entities/request.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { EmployeeBalance } from '../../balance/entities/employee-balance.entity';

@Entity('employees')
export class Employee extends BaseEntity {
  @Column({ unique: true, length: 20 })
  employeeCode: string;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  position: string;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isHr: boolean;

  @Column()
  @Exclude()
  passwordHash: string;

  @ManyToOne(() => Department, (department) => department.employees)
  @JoinColumn({ name: 'departmentId' })
  department: Department  |null;

  @ManyToOne(() => Employee, (employee) => employee.subordinates, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager?: Employee |null;

  @OneToMany(() => Employee, (employee) => employee.manager)
  subordinates: Employee[];

  @OneToMany(() => Request, (request) => request.employee)
  requests: Request[];

  @OneToMany(() => Attendance, (attendance) => attendance.employee)
  attendances: Attendance[];

  @OneToMany(() => EmployeeBalance, (balance) => balance.employee)
  balances: EmployeeBalance[];

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}