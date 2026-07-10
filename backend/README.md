# Booking Platform REST API

A comprehensive REST API for managing services and customer bookings, built with NestJS, TypeScript, and PostgreSQL.

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

## Installation

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

Edit `.env` with your configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_DATABASE=booking_platform
DB_SYNCHRONIZE=true

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d
```

4. Create PostgreSQL database:
```bash
createdb booking_platform
```

5. (Optional) Generate and run migrations:
```bash
# Generate a migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

> **Note**: By default, the application uses `DB_SYNCHRONIZE=true` which automatically creates/updates tables. For production, set `DB_SYNCHRONIZE=false` and use migrations instead.

6. Seed the admin user:
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
Swagger documentation at `http://localhost:3000/api`

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

#### Step 7: Create a Booking (Customer token required)

Authorize with customer token, then:

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

#### Step 8: View Bookings (Authenticated)

**Endpoint**: `GET /bookings`
```
?page=1&limit=10&search=John&status=PENDING
```
Expected: `200 OK` with paginated results

---

#### Step 9: Admin Views All Bookings

Authorize with admin token, then:

**Endpoint**: `GET /bookings/admin/all`

Expected: `200 OK`

---

#### Step 10: Customer Cannot Use Admin Endpoint (Should Return 403)

Authorize with customer token, then:

**Endpoint**: `GET /bookings/admin/all`

Expected: `403 Forbidden`

---

#### Step 11: Update Booking Status

**Endpoint**: `PATCH /bookings/:id/status`

```json
{
  "status": "CONFIRMED"
}
```

Expected: `200 OK`

---

#### Step 12: Cancel Booking

**Endpoint**: `PATCH /bookings/:id/cancel`

Expected: `200 OK`

---

#### Step 13: Cancelled → Completed Should Fail

Try updating a cancelled booking to COMPLETED:

**Endpoint**: `PATCH /bookings/:id/status`

```json
{
  "status": "COMPLETED"
}
```

Expected: `400 Bad Request` – "Cancelled booking cannot be marked as completed"

---

#### Step 14: Duplicate Booking Should Return 409

Try creating the same booking (same serviceId + date + time):

Expected: `409 Conflict`

---

#### Step 15: Refresh Access Token

**Endpoint**: `POST /auth/refresh-token`

```json
{
  "refreshToken": "<your-refresh-token>"
}
```

Expected: `200 OK` with new tokens

---

#### Step 16: Logout

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
| POST | `/bookings` | ✅ | Any | Create booking |
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
   - Any authenticated user can create a booking
   - Booking must reference an existing, valid service
   - Booking date cannot be in the past
   - Duplicate bookings for the same service, date, and time are prevented (HTTP 409)

4. **Booking Status**:
   - Cancelled bookings cannot be marked as completed (HTTP 400)
   - Any authenticated user can update booking status or cancel bookings

5. **User Management**:
   - Only `ADMIN` users can list all users or view user by ID

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | — |
| `DB_DATABASE` | Database name | `booking_platform` |
| `DB_SYNCHRONIZE` | Auto-sync schema (dev only) | `true` |
| `DB_MIGRATIONS_RUN` | Auto-run migrations on start | `false` |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRES_IN` | Access token expiry | `1d` |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | — |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |

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

1. **Email Notifications**: Send confirmation emails for bookings
2. **Rate Limiting**: Implement rate limiting with `@nestjs/throttler`
3. **Caching**: Add Redis caching for frequently accessed services data
4. **Logging**: Implement structured logging with `winston` or `pino`
5. **API Versioning**: Add versioning to API endpoints (`/v1/...`)
6. **File Upload**: Add support for service images
7. **Payment Integration**: Integrate payment gateway for booking payments
8. **Service Availability**: Add service slot availability management
9. **User Profile Updates**: Allow users to update their own profile

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
