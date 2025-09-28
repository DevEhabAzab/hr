import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Employee } from '../../employee/entities/employee.entity';

@Entity('employee_balances')
@Unique(['employee', 'year'])
export class EmployeeBalance extends BaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.balances)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ default: 21 })
  vacationDaysTotal: number;

  @Column({ default: 0 })
  vacationDaysUsed: number;

  @Column({ default: 24 })
  wfhDaysTotal: number;

  @Column({ default: 0 })
  wfhDaysUsed: number;

  @Column({ default: 40 })
  lateEarlyHoursTotal: number;

  @Column({ default: 0 })
  lateEarlyHoursUsed: number;

  @Column()
  year: number;

  get vacationDaysRemaining(): number {
    return this.vacationDaysTotal - this.vacationDaysUsed;
  }

  get wfhDaysRemaining(): number {
    return this.wfhDaysTotal - this.wfhDaysUsed;
  }

  get lateEarlyHoursRemaining(): number {
    return this.lateEarlyHoursTotal - this.lateEarlyHoursUsed;
  }
}