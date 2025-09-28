import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, RequestStatus, ApprovalStatus } from './entities/request.entity';
import { RequestType } from './entities/request-type.entity';
import { Employee } from '../employee/entities/employee.entity';
import { EmployeeBalance } from '../balance/entities/employee-balance.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(RequestType)
    private requestTypeRepository: Repository<RequestType>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeBalance)
    private balanceRepository: Repository<EmployeeBalance>,
  ) {}

  async create(createRequestDto: CreateRequestDto, employeeId: string): Promise<Request> {
    // Get employee and request type
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
      relations: ['manager'],
    });
    
    const requestType = await this.requestTypeRepository.findOne({
      where: { id: createRequestDto.requestTypeId },
    });

    if (!requestType) {
      throw new NotFoundException('Request type not found');
    }

    // Calculate request duration and validate
    const startDate = new Date(createRequestDto.startDate);
    const endDate = new Date(createRequestDto.endDate);
    
    if (startDate > endDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    // Check advance notice
    const daysDifference = Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (daysDifference > requestType.maxAdvanceDays) {
      throw new BadRequestException(`Request can only be made ${requestType.maxAdvanceDays} days in advance`);
    }

    // Calculate duration based on request type
    let totalDays = 0;
    let totalHours = 0;

    if (['vacation', 'work_from_home'].includes(requestType.name)) {
      totalDays = this.calculateWorkingDays(startDate, endDate);
    } else if (['late_arrival', 'early_departure'].includes(requestType.name)) {
      const startTime = new Date(`1970-01-01T${createRequestDto.startTime}`);
      const endTime = new Date(`1970-01-01T${createRequestDto.endTime}`);
      totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    }

    // Check if employee has sufficient balance
    await this.checkBalance(employeeId, requestType.name, totalDays, totalHours, startDate.getFullYear());

    const request = this.requestRepository.create({
      ...createRequestDto,
      employee,
      requestType,
      totalDays,
      totalHours,
    });

    return this.requestRepository.save(request);
  }

  async findAll(employeeId: string, isHr = false): Promise<Request[]> {
    const whereCondition = isHr ? {} : { employee: { id: employeeId } };
    
    return this.requestRepository.find({
      where: whereCondition,
      relations: ['employee', 'requestType', 'approvedByManager', 'approvedByHr'],
      order: { createdAt: 'DESC' },
      select: {
        employee: { id: true, firstName: true, lastName: true, employeeCode: true },
        requestType: { id: true, name: true },
        approvedByManager: { id: true, firstName: true, lastName: true },
        approvedByHr: { id: true, firstName: true, lastName: true },
      },
    });
  }

  async findPendingApprovals(managerId: string, isHr = false): Promise<Request[]> {
    const queryBuilder = this.requestRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.employee', 'employee')
      .leftJoinAndSelect('request.requestType', 'requestType')
      .where('request.status = :status', { status: RequestStatus.PENDING });

    if (isHr) {
      // HR can see all requests requiring HR approval
      queryBuilder.andWhere('requestType.requiresHrApproval = true')
        .andWhere('request.hrApprovalStatus = :hrStatus', { hrStatus: ApprovalStatus.PENDING })
        .andWhere('request.managerApprovalStatus = :managerStatus', { managerStatus: ApprovalStatus.APPROVED });
    } else {
      // Managers can see requests from their subordinates
      queryBuilder.andWhere('employee.managerId = :managerId', { managerId })
        .andWhere('request.managerApprovalStatus = :managerStatus', { managerStatus: ApprovalStatus.PENDING });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, employeeId: string, isHr = false): Promise<Request> {
    const queryBuilder = this.requestRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.employee', 'employee')
      .leftJoinAndSelect('request.requestType', 'requestType')
      .leftJoinAndSelect('request.approvedByManager', 'approvedByManager')
      .leftJoinAndSelect('request.approvedByHr', 'approvedByHr')
      .where('request.id = :id', { id });

    if (!isHr) {
      queryBuilder.andWhere('employee.id = :employeeId', { employeeId });
    }

    const request = await queryBuilder.getOne();

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async approve(id: string, approveRequestDto: ApproveRequestDto, approverId: string, isHr = false): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['employee', 'requestType', 'employee.manager'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    // Check authorization
    if (!isHr && request.employee.manager?.id !== approverId) {
      throw new ForbiddenException('You can only approve requests from your subordinates');
    }

    const approver = await this.employeeRepository.findOne({ where: { id: approverId } });

    if (isHr) {
      // HR approval
      request.hrApprovalStatus = approveRequestDto.approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
      request.hrApprovalDate = new Date();
      request.hrApprovalComment = approveRequestDto.comment;
      request.approvedByHr = approver;
    } else {
      // Manager approval
      request.managerApprovalStatus = approveRequestDto.approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
      request.managerApprovalDate = new Date();
      request.managerApprovalComment = approveRequestDto.comment;
      request.approvedByManager = approver;
    }

    // Update overall status
    if (request.requestType.requiresHrApproval) {
      if (request.managerApprovalStatus === ApprovalStatus.APPROVED && request.hrApprovalStatus === ApprovalStatus.APPROVED) {
        request.status = RequestStatus.APPROVED;
        await this.updateBalance(request);
      } else if (request.managerApprovalStatus === ApprovalStatus.REJECTED || request.hrApprovalStatus === ApprovalStatus.REJECTED) {
        request.status = RequestStatus.REJECTED;
      }
    } else {
      if (request.managerApprovalStatus === ApprovalStatus.APPROVED) {
        request.status = RequestStatus.APPROVED;
        await this.updateBalance(request);
      } else if (request.managerApprovalStatus === ApprovalStatus.REJECTED) {
        request.status = RequestStatus.REJECTED;
      }
    }

    return this.requestRepository.save(request);
  }

  async cancel(id: string, employeeId: string): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id, employee: { id: employeeId } },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== Request)
        console.log("start dev from here next time")
    }

}