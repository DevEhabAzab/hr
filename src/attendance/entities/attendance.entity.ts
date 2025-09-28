import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Employee } from '../../employee/entities/employee.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EARLY_DEPARTURE = 'early_departure',
  WORK_FROM_HOME = 'work_from_home',
}

@Entity('attendance')
@Unique(['employee', 'date'])
export class Attendance extends BaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.attendances)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time', nullable: true })
  clockIn: string;

  @Column({ type: 'time', nullable: true })
  clockOut: string;

  @Column({ type: 'time', nullable: true })
  breakStart: string;

  @Column({ type: 'time', nullable: true })
  breakEnd: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  totalHours: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;
}