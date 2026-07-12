# Booking Platform REST API

A comprehensive REST API for managing services and customer bookings, built with NestJS, TypeScript, and PostgreSQL.

## Project Overview

This Booking Platform REST API provides a complete backend solution for service-based businesses to manage their services and customer bookings. The system includes:

- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Service Management**: Admins can create, update, and delete services
- **Booking System**: Customers can book services with validation and business rules
- **Admin Dashboard**: Admins can view all bookings and users
- **API Documentation**: Interactive Swagger documentation for easy testing

The API follows RESTful principles and includes comprehensive validation, error handling, and security features.

## Quick Start

**Swagger API Documentation**: http://localhost:3000/api

Start the server:
```bash
npm run start:dev
```

### Quick Test with Swagger

1. Open http://localhost:3000/api in your browser
2. **Register a user**: POST `/auth/register`
   ```json
   {
     "fullName": "John Doe",
     "email": "john@example.com",
     "password": "password123"
   }
   ```
3. **Login**: POST `/auth/login` to get your JWT token
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```
4. **Authorize in Swagger**: Click the 🔓 button, paste your access token
5. **Create a service** (requires admin token): POST `/services`
   ```json
   {
     "title": "Haircut",
     "description": "Professional haircut service",
     "duration": 30,
     "price": 25.00,
     "isActive": true
   }
   ```
6. **Create a booking** (no auth required): POST `/bookings`
   ```json
   {
     "customerName": "John Doe",
     "customerEmail": "john@example.com",
     "customerPhone": "1234567890",
     "serviceId": "<service-uuid-from-step-5>",
     "bookingDate": "2027-12-25",
     "bookingTime": "14:30",
     "notes": "First time customer"
   }
   ```

## Features

- **Authentication**: JWT-based authentication with access and refresh tokens
- **Role-Based Access Control**: ADMIN and CUSTOMER roles with route-level enforcement
- **Service Management**: CRUD operations for services (ADMIN only)
- **Booking Management**: Create, view, update status, and cancel bookings
- **Business Logic**:
  - Booking dates cannot be in the past
  - Cancelled bookings cannot be marked as completed
  - Duplicate booking prevention for same service, date, and time
- **Bonus Features**:
  - Pagination for bookings
  - Search bookings by customer name, email, or phone
  - Filter bookings by status
  - Swagger API documentation
  - Docker support
  - Global validation and exception handling
  - Refresh token support

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (Passport)
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Containerization**: Docker & Docker Compose

## Project Structure

```
backend/
├── src/
│   ├── common/
│   │   ├── decorators/      # @Roles() custom decorator
│   │   ├── enums/           # Shared enums (Role)
│   │   ├── filters/         # Global exception filters
│   │   └── guards/          # RolesGuard for RBAC
│   ├── config/              # Configuration management
│   ├── database/            # Database config and data-source
│   ├── modules/
│   │   ├── auth/            # Authentication module (JWT, refresh token, strategies, guards)
│   │   ├── bookings/        # Bookings module (entity, DTOs, service, controller)
│   │   ├── services/        # Services module (entity, DTOs, service, controller)
│   │   └── users/           # Users module (entity, service, controller)
│   ├── seeds/               # Database seed scripts
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Installation Steps

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Booking-Platform-REST-API/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

## Environment Variables

Edit `.env` with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_DATABASE=booking_platform
DB_SYNCHRONIZE=true
DB_MIGRATIONS_RUN=false

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3000
```

### Environment Variables Description

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL host address | `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | Yes |
| `DB_USERNAME` | PostgreSQL username | `postgres` | Yes |
| `DB_PASSWORD` | PostgreSQL password | — | Yes |
| `DB_DATABASE` | Database name | `booking_platform` | Yes |
| `DB_SYNCHRONIZE` | Auto-sync schema (dev only) | `true` | No |
| `DB_MIGRATIONS_RUN` | Auto-run migrations on start | `false` | No |
| `JWT_SECRET` | JWT signing secret | — | Yes |
| `JWT_EXPIRES_IN` | Access token expiry time | `1d` | No |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | — | Yes |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry time | `7d` | No |
| `PORT` | Server port | `3000` | No |

## Database Setup

### Option 1: Using Docker (Recommended)

```bash
docker-compose up -d
```

This will start PostgreSQL and the application together.

### Option 2: Manual PostgreSQL Setup

4. Create PostgreSQL database:
```bash
createdb booking_platform
```

## Running Migrations

### What are Database Migration Files?

Database migration files are TypeScript files that define changes to your database schema over time. They allow you to:

- **Version control your database schema**
- **Roll back changes if needed**
- **Deploy consistent database structures across environments**
- **Track schema changes in your codebase**

Migration files are stored in the `migrations/` directory (generated when you run migration commands) and contain SQL or TypeScript code to create/modify tables, add columns, create indexes, etc.

### When to Use Migrations vs Synchronize

- **Development**: Use `DB_SYNCHRONIZE=true` for automatic schema updates (faster development)
- **Production**: Use `DB_SYNCHRONIZE=false` and migrations for controlled, versioned changes

### Migration Commands

```bash
# Generate a migration based on entity changes
npm run migration:generate -- -n MigrationName

# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Show all migrations
npm run typeorm -- migration:show -d src/database/data-source.ts
```

### Example Workflow

1. Make changes to your entity files (e.g., add a new column to `ServiceEntity`)
2. Generate a migration:
   ```bash
   npm run migration:generate -- -n AddServiceCategory
   ```
3. Review the generated migration file in `migrations/`
4. Run the migration:
   ```bash
   npm run migration:run
   ```

> **Note**: By default, this application uses `DB_SYNCHRONIZE=true` for development. For production, set `DB_SYNCHRONIZE=false` and use migrations instead.

### Seed the Database

After setting up the database, seed the admin user:

```bash
npm run seed
```

This will create an admin user with:
- **Email**: admin@bookingplatform.com
- **Password**: Admin@123
- **Role**: ADMIN

> **Important**: Change the admin password after first login in production!

## Running the Application

### Development Mode

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`  
**Swagger documentation at `http://localhost:3000/api`**

### Swagger API Documentation

Access the interactive API documentation at: **http://localhost:3000/api**

#### How to Authenticate in Swagger

1. Click the **Authorize** button (🔒) at the top right
2. Enter your JWT access token (obtained from `POST /auth/login`)
3. Click **Authorize** — token will be sent as `Authorization: Bearer <token>` header

### Production Mode

```bash
npm run build
npm run start:prod
```

### Using Docker

```bash
docker-compose up
```

This will start both the PostgreSQL database and the API server.

## Swagger Testing Guide

Access the interactive API documentation at: **http://localhost:3000/api**

### How to Authenticate in Swagger

1. Click the **Authorize** button (🔒) at the top right
2. Enter your JWT access token (obtained from `POST /auth/login`)
3. Click **Authorize** — token will be sent as `Authorization: Bearer <token>` header

---

### Complete Test Flow

#### Step 1: Register as Customer

**Endpoint**: `POST /auth/register`

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Expected: `201 Created` (role automatically set to `CUSTOMER`)

---

#### Step 2: Login and Get Tokens

**Endpoint**: `POST /auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Expected: `200 OK` with `access_token` and `refresh_token`

---

#### Step 3: Login as Admin

**Endpoint**: `POST /auth/login`

```json
{
  "email": "admin@bookingplatform.com",
  "password": "Admin@123"
}
```

Expected: `200 OK` with tokens — copy the `access_token`

---

#### Step 4: Admin Creates a Service (Admin token required)

Authorize with admin token in Swagger, then:

**Endpoint**: `POST /services`

```json
{
  "title": "Haircut",
  "description": "Professional haircut service",
  "duration": 30,
  "price": 25.00,
  "isActive": true
}
```

Expected: `201 Created`

---

#### Step 5: View All Services (No Auth Required)

**Endpoint**: `GET /services`
Expected: `200 OK` (public endpoint, no token needed)

**Endpoint**: `GET /services/:id`
Expected: `200 OK` or `404 Not Found`

---

#### Step 6: Customer Cannot Create Service (Should Return 403)

Authorize with customer token, then:

**Endpoint**: `POST /services`

Expected: `403 Forbidden`

---

#### Step 7: Update Service (Admin Only)

Authorize with admin token, then:

**Endpoint**: `PATCH /services/:id`

```json
{
  "title": "Premium Haircut",
  "price": 35.00
}
```

Expected: `200 OK`

---

#### Step 8: Delete Service (Admin Only)

Authorize with admin token, then:

**Endpoint**: `DELETE /services/:id`

Expected: `200 OK`

---

#### Step 9: Create a Booking (No authentication required)

**Endpoint**: `POST /bookings`

```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "1234567890",
  "serviceId": "<uuid-from-step-4>",
  "bookingDate": "2027-12-25",
  "bookingTime": "14:30",
  "notes": "First time customer"
}
```

Expected: `201 Created`

---

#### Step 10: View Bookings (Authenticated)

Authorize with any token, then:

**Endpoint**: `GET /bookings`
```
?page=1&limit=10&search=John&status=PENDING
```
Expected: `200 OK` with paginated results

---

#### Step 11: Admin Views All Bookings

Authorize with admin token, then:

**Endpoint**: `GET /bookings/admin/all`

Expected: `200 OK`

---

#### Step 12: Customer Cannot Use Admin Endpoint (Should Return 403)

Authorize with customer token, then:

**Endpoint**: `GET /bookings/admin/all`

Expected: `403 Forbidden`

---

#### Step 13: Update Booking Status

Authorize with any token, then:

**Endpoint**: `PATCH /bookings/:id/status`

```json
{
  "status": "CONFIRMED"
}
```

Expected: `200 OK`

---

#### Step 14: Cancel Booking

Authorize with any token, then:

**Endpoint**: `PATCH /bookings/:id/cancel`

Expected: `200 OK`

---

#### Step 15: Cancelled → Completed Should Fail

Try updating a cancelled booking to COMPLETED:

**Endpoint**: `PATCH /bookings/:id/status`

```json
{
  "status": "COMPLETED"
}
```

Expected: `400 Bad Request` – "Cancelled booking cannot be marked as completed"

---

#### Step 16: Duplicate Booking Should Return 409

Try creating the same booking (same serviceId + date + time):

Expected: `409 Conflict`

---

#### Step 17: Refresh Access Token

**Endpoint**: `POST /auth/refresh-token`

```json
{
  "refreshToken": "<your-refresh-token>"
}
```

Expected: `200 OK` with new tokens

---

#### Step 18: Logout

**Endpoint**: `POST /auth/logout`
Expected: `200 OK`

---

## API Endpoints Summary

### Authentication

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/register` | ❌ | — | Register a new user |
| POST | `/auth/login` | ❌ | — | Login, receive tokens |
| POST | `/auth/refresh-token` | ❌ | — | Refresh access token |
| GET | `/auth/me` | ✅ | Any | Get current user |
| POST | `/auth/logout` | ✅ | Any | Logout |

### Services

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/services` | ✅ | ADMIN | Create service |
| GET | `/services` | ❌ | — | Get all services (public) |
| GET | `/services/:id` | ❌ | — | Get service by ID (public) |
| PATCH | `/services/:id` | ✅ | ADMIN | Update service |
| DELETE | `/services/:id` | ✅ | ADMIN | Delete service |

### Bookings

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/bookings` | ❌ | — | Create booking (public) |
| GET | `/bookings` | ✅ | Any | Get all bookings (paginated, search, filter) |
| GET | `/bookings/admin/all` | ✅ | ADMIN | Admin view of all bookings |
| GET | `/bookings/:id` | ✅ | Any | Get booking by ID |
| PATCH | `/bookings/:id/status` | ✅ | Any | Update booking status |
| PATCH | `/bookings/:id/cancel` | ✅ | Any | Cancel booking |

### Users

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/users` | ✅ | ADMIN | Get all users |
| GET | `/users/:id` | ✅ | ADMIN | Get user by ID |

---

## Database Schema

### Users
| Column | Type | Notes |
|--------|------|-------|
| id | integer (PK) | Auto-generated |
| fullName | varchar | Required |
| email | varchar (unique) | Required |
| password | varchar | Hashed, excluded from queries |
| refreshToken | varchar (nullable) | Hashed, excluded from queries |
| role | enum (ADMIN/CUSTOMER) | Default: CUSTOMER |
| createdAt | timestamp | Auto-generated |
| updatedAt | timestamp | Auto-updated |

### Services
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Auto-generated |
| title | varchar(150) | Required |
| description | text | Required |
| duration | integer | Duration in minutes |
| price | decimal(10,2) | Required |
| isActive | boolean | Default: true |
| createdAt | timestamp | Auto-generated |
| updatedAt | timestamp | Auto-updated |

### Bookings
| Column | Type | Notes |
|--------|------|-------|
| id | integer (PK) | Auto-generated |
| customerName | varchar | Required |
| customerEmail | varchar | Required |
| customerPhone | varchar | 10-digit number |
| bookingDate | date | Cannot be in the past |
| bookingTime | varchar | HH:MM 24-hour format |
| notes | varchar (nullable) | Optional |
| status | enum | PENDING/CONFIRMED/CANCELLED/COMPLETED |
| serviceId | uuid (FK) | References services.id |
| createdAt | timestamp | Auto-generated |
| updatedAt | timestamp | Auto-updated |

**Unique constraint**: `(serviceId, bookingDate, bookingTime)` — prevents duplicate bookings

---

## Business Rules

1. **User Roles**:
   - **CUSTOMER**: Can view services, create and manage bookings
   - **ADMIN**: Can manage services (CRUD) and view all users and bookings
   - All registered users automatically get the `CUSTOMER` role
   - Admin user is created via the seed script only

2. **Service Management**:
   - Only `ADMIN` users can create, update, or delete services
   - All users (authenticated and unauthenticated) can view services

3. **Booking Creation**:
   - Anyone (authenticated or unauthenticated) can create a booking
   - Booking must reference an existing, valid service
   - Booking date cannot be in the past
   - Duplicate bookings for the same service, date, and time are prevented (HTTP 409)

4. **Booking Status**:
   - Cancelled bookings cannot be marked as completed (HTTP 400)
   - Any authenticated user can update booking status or cancel bookings

5. **User Management**:
   - Only `ADMIN` users can list all users or view user by ID

---

## API Documentation

### Swagger/OpenAPI Documentation

The API includes interactive Swagger documentation that allows you to:

- **Explore all endpoints** with detailed descriptions
- **Test API calls** directly from the browser
- **View request/response schemas**
- **Authenticate** using JWT tokens

**Access Swagger at**: http://localhost:3000/api

### Authentication in Swagger

1. Click the **Authorize** button (🔓) at the top right of the Swagger UI
2. Enter your JWT access token (obtained from `POST /auth/login`)
3. Click **Authorize**
4. The token will be sent as `Authorization: Bearer <token>` header for all authenticated requests

### API Endpoint Categories

#### Authentication Endpoints
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive tokens
- `POST /auth/refresh-token` - Refresh access token
- `GET /auth/me` - Get current user profile
- `POST /auth/logout` - Logout and clear refresh token

#### Service Endpoints
- `POST /services` - Create a service (Admin only)
- `GET /services` - Get all services (Public)
- `GET /services/:id` - Get service by ID (Public)
- `PATCH /services/:id` - Update service (Admin only)
- `DELETE /services/:id` - Delete service (Admin only)

#### Booking Endpoints
- `POST /bookings` - Create a booking (Public)
- `GET /bookings` - Get all bookings with pagination (Authenticated)
- `GET /bookings/admin/all` - Get all bookings (Admin only)
- `GET /bookings/:id` - Get booking by ID (Authenticated)
- `PATCH /bookings/:id/status` - Update booking status (Authenticated)
- `PATCH /bookings/:id/cancel` - Cancel booking (Authenticated)

#### User Endpoints
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID (Admin only)

### Response Format

All API responses follow a consistent format:

**Success Response (2xx)**
```json
{
  "id": 1,
  "title": "Haircut",
  "description": "Professional haircut service",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (4xx/5xx)**
```json
{
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/bookings",
  "message": "Booking date cannot be in the past"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Request successful |
| `201` | Resource created successfully |
| `400` | Bad request - validation error or invalid data |
| `401` | Unauthorized - missing or invalid token |
| `403` | Forbidden - insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict - duplicate resource |
| `500` | Internal server error |

---

## Assumptions Made

1. The application uses `DB_SYNCHRONIZE=true` for development (disable in production with migrations)
2. Refresh tokens are stored hashed in the database (for production, consider Redis)
3. Phone numbers are validated as exactly 10-digit numbers
4. Time format follows 24-hour format (`HH:MM`)
5. Service duration is measured in minutes
6. All registrations default to `CUSTOMER` role; admin must be seeded manually

---

## Future Improvements

### Security & Performance
1. **Rate Limiting**: Implement rate limiting with `@nestjs/throttler` to prevent API abuse
2. **Caching**: Add Redis caching for frequently accessed services data to reduce database load
3. **Logging**: Implement structured logging with `winston` or `pino` for better debugging and monitoring
4. **Request Validation**: Add more advanced validation rules and custom validators

### Features
5. **Email Notifications**: Send confirmation emails for bookings and status updates
6. **File Upload**: Add support for service images and user avatars
7. **Payment Integration**: Integrate payment gateway (Stripe, PayPal) for booking payments
8. **Service Availability**: Add service slot availability management and calendar view
9. **User Profile Updates**: Allow users to update their own profile information
10. **Booking Reminders**: Implement automated reminders before booking time

### Architecture & Scalability
11. **API Versioning**: Add versioning to API endpoints (`/v1/...`, `/v2/...`)
12. **Microservices**: Split into microservices for better scalability (auth, bookings, services)
13. **Message Queue**: Implement RabbitMQ or Kafka for asynchronous processing
14. **Database Optimization**: Add database indexes, query optimization, and read replicas
15. **CDN Integration**: Use CDN for static assets and file uploads

### Testing & Quality
16. **Unit Tests**: Add comprehensive unit tests for all services and controllers
17. **E2E Tests**: Implement end-to-end testing with Playwright or Cypress
18. **Integration Tests**: Add integration tests for database operations
19. **Code Quality**: Set up ESLint, Prettier, and Husky for pre-commit hooks
20. **CI/CD Pipeline**: Implement GitHub Actions or GitLab CI for automated testing and deployment

### Documentation
21. **API Documentation**: Enhance Swagger documentation with more examples and descriptions
22. **Developer Guide**: Add detailed developer guide for contributing to the project
23. **Architecture Diagrams**: Include architecture diagrams and system design documentation

---

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## License

This project is licensed under the UNLICENSED license.
