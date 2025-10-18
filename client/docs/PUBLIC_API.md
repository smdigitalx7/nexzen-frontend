# Public API Endpoints

Base prefix: `/api/v1`

Note: Dynamic segments are shown in `{curly}` braces.

## Health (`/api/v1/health`)
- GET `/api/v1/health/live` — liveness probe
- GET `/api/v1/health/ready` — readiness probe with database and Redis checks

## Authentication (`/api/v1/auth`)
- POST `/api/v1/auth/login` — user login
- POST `/api/v1/auth/refresh` — refresh access token
- POST `/api/v1/auth/switch-branch/{branch_id}` — switch user branch
- POST `/api/v1/auth/switch-academic-year/{academic_year_id}` — switch academic year
- POST `/api/v1/auth/logout` — user logout
- GET `/api/v1/auth/me` — get current user info
- GET `/api/v1/auth/instituteAdmin` — get institute admin info

## Users (`/api/v1/users`)
- GET `/api/v1/users/dashboard` — get user dashboard stats
- GET `/api/v1/users` — list all users
- GET `/api/v1/users/roles-and-branches` — get users with roles and branches
- GET `/api/v1/users/{id}` — get user by id
- POST `/api/v1/users` — create user
- PUT `/api/v1/users/{id}` — update user
- DELETE `/api/v1/users/{id}` — delete user

## Roles (`/api/v1/roles`)
- GET `/api/v1/roles` — list all roles
- GET `/api/v1/roles/{id}` — get role by id
- PUT `/api/v1/roles/{id}` — update role

## Branches (`/api/v1/branches`)
- GET `/api/v1/branches` — list all branches
- GET `/api/v1/branches/{id}` — get branch by id
- POST `/api/v1/branches` — create branch
- PUT `/api/v1/branches/{id}` — update branch
- DELETE `/api/v1/branches/{id}` — delete branch

## User Branch Accesses (`/api/v1/user-branch-accesses`)
- GET `/api/v1/user-branch-accesses` — list user branch accesses
- GET `/api/v1/user-branch-accesses/{id}` — get user branch access by id
- POST `/api/v1/user-branch-accesses` — create user branch access
- PUT `/api/v1/user-branch-accesses/revoke/{id}` — revoke user branch access

## Academic Years (`/api/v1/academic-years`)
- GET `/api/v1/academic-years` — list academic years
- GET `/api/v1/academic-years/{id}` — get academic year by id

## Employees (`/api/v1/employees`)
- GET `/api/v1/employees/dashboard` — get employee dashboard stats
- GET `/api/v1/employees/recent` — get recent employees
- GET `/api/v1/employees` — list all employees
- GET `/api/v1/employees/{id}` — get employee by id
- POST `/api/v1/employees` — create employee
- PUT `/api/v1/employees/{id}` — update employee
- DELETE `/api/v1/employees/{id}` — delete employee

## Branch Employees (`/api/v1/branch-employees`)
- GET `/api/v1/branch-employees` — list branch employees
- GET `/api/v1/branch-employees/{id}` — get branch employee by id
- POST `/api/v1/branch-employees` — create branch employee
- DELETE `/api/v1/branch-employees/{id}` — delete branch employee

## Employee Attendance (`/api/v1/employee-attendances`)
- GET `/api/v1/employee-attendances/dashboard` — get attendance dashboard
- GET `/api/v1/employee-attendances` — list employee attendances
- GET `/api/v1/employee-attendances/branch` — list by branch
- GET `/api/v1/employee-attendances/{id}` — get attendance by id
- POST `/api/v1/employee-attendances` — create attendance
- PUT `/api/v1/employee-attendances/{id}` — update attendance
- DELETE `/api/v1/employee-attendances/{id}` — delete attendance

## Employee Leave (`/api/v1/employee-leaves`)
- GET `/api/v1/employee-leaves/dashboard` — get leave dashboard
- GET `/api/v1/employee-leaves/recent` — get recent leaves
- GET `/api/v1/employee-leaves` — list employee leaves
- GET `/api/v1/employee-leaves/branch` — list by branch
- GET `/api/v1/employee-leaves/{leave_id}` — get leave by id
- POST `/api/v1/employee-leaves` — create leave
- PUT `/api/v1/employee-leaves/{leave_id}` — update leave
- PUT `/api/v1/employee-leaves/{leave_id}/approve` — approve leave
- PUT `/api/v1/employee-leaves/{leave_id}/reject` — reject leave
- DELETE `/api/v1/employee-leaves/{leave_id}` — delete leave

## Payroll (`/api/v1/payrolls`)
- GET `/api/v1/payrolls/dashboard` — get payroll dashboard
- GET `/api/v1/payrolls/recent` — get recent payrolls
- GET `/api/v1/payrolls` — list payrolls
- GET `/api/v1/payrolls/{id}` — get payroll by id
- POST `/api/v1/payrolls` — create payroll
- PUT `/api/v1/payrolls/{id}` — update payroll
- DELETE `/api/v1/payrolls/{id}` — delete payroll

## Advances (`/api/v1/advances`)
- GET `/api/v1/advances/dashboard` — get advances dashboard
- GET `/api/v1/advances/recent` — get recent advances
- GET `/api/v1/advances` — list advances
- GET `/api/v1/advances/{id}` — get advance by id
- POST `/api/v1/advances` — create advance
- PUT `/api/v1/advances/{id}` — update advance
- DELETE `/api/v1/advances/{id}` — delete advance

## Bus Routes (`/api/v1/bus-routes`)
- GET `/api/v1/bus-routes` — list all bus routes
- GET `/api/v1/bus-routes/names` — get route names only
- GET `/api/v1/bus-routes/{bus_route_id}` — get route by id
- POST `/api/v1/bus-routes` — create bus route
- PUT `/api/v1/bus-routes/{bus_route_id}` — update bus route
- DELETE `/api/v1/bus-routes/{bus_route_id}` — delete bus route

## Distance Slabs (`/api/v1/distance-slabs`)
- GET `/api/v1/distance-slabs` — list distance slabs
- GET `/api/v1/distance-slabs/{id}` — get distance slab by id
- POST `/api/v1/distance-slabs` — create distance slab
- PUT `/api/v1/distance-slabs/{id}` — update distance slab
- DELETE `/api/v1/distance-slabs/{id}` — delete distance slab

## Announcements (`/api/v1/announcements`)
- GET `/api/v1/announcements` — list announcements
- GET `/api/v1/announcements/{id}` — get announcement by id
- POST `/api/v1/announcements` — create announcement
- PUT `/api/v1/announcements/{id}` — update announcement
- DELETE `/api/v1/announcements/{id}` — delete announcement

## Logs (`/api/v1/logs`)
- GET `/api/v1/logs` — list system logs
- GET `/api/v1/logs/{id}` — get log by id

## Public Dropdowns (`/api/v1/dropdowns`)
- GET `/api/v1/dropdowns/enums` — get public dropdown enums
