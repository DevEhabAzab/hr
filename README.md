# HR Application - NestJS Backend

A comprehensive HR Management System built with NestJS, PostgreSQL, and TypeORM.

## Features

- **Employee Management**: Hierarchical employee structure with managers
- **Authentication**: JWT-based authentication with role-based access
- **Request System**: Work from home, vacation, late arrival, early departure requests
- **Attendance Tracking**: Clock in/out, break time, working hours calculation
- **Balance Management**: Automatic tracking of vacation, WFH, and flexible hours
- **Approval Workflow**: Manager and HR approval system
- **Swagger Documentation**: Auto-generated API documentation

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations (make sure PostgreSQL is running)
# First, create the database using the SQL schema provided separately

# Start the application
npm run start:dev
```

## API Endpoints

### Authentication
- `POST /auth/login` - Employee login

### Employees
- `GET /employees` - Get all employees (HR only)
- `GET /employees/me` - Get current user profile
- `POST /employees` - Create employee (HR only)
- `PATCH /employees/:id` - Update employee (HR only)

### Requests
- `GET /requests` - Get user's requests
- `POST /requests` - Create new request
- `PATCH /requests/:id/approve` - Approve/reject request (Manager/HR)

### Attendance
- `GET /attendance` - Get attendance records
- `POST /attendance/clock-in` - Clock in
- `POST /attendance/clock-out` - Clock out

### Balances
- `GET /balances` - Get current year balances
- `GET /balances/:year` - Get specific year balances

## Usage

1. **Setup Database**: Run the PostgreSQL schema provided separately
2. **Create HR User**: Insert initial HR user in database
3. **Start Application**: `npm run start:dev`
4. **Access Swagger**: http://localhost:3000/api
5. **Login**: Use HR credentials to access the system

## Authentication

All endpoints (except login) require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access

- **HR**: Full access to all employee data and system management
- **Manager**: Can approve requests from subordinates
- **Employee**: Can manage own profile, requests, and attendance

## Database Schema

This application works with the PostgreSQL database schema provided separately. Make sure to run the database setup script before starting the application.