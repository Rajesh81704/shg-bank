# SHG Bank System

Self Help Group Banking and Loan Management System built with FastAPI and PostgreSQL.

## Features

- User authentication with JWT tokens
- Admin and member role management
- Payment tracking and management
- Loan application and approval system
- Penalty calculation for late payments
- Dashboard and reporting

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `.env`:
```
PGHOST=your-postgres-host
PGDATABASE=your-database-name
PGUSER=your-username
PGPASSWORD=your-password
PGSSLMODE=require
SECRET_KEY=your-secret-key
```

3. Initialize the database:
```bash
# Run the DDL script in your PostgreSQL database
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f ddl.sql
```

4. Start the server:
```bash
python run.py
```

Or with uvicorn directly:
```bash
uvicorn app.main:app --reload
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Admin Operations
- `POST /api/admin/users` - Create new member (admin only)
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/admin/loans` - List all loans (admin only)
- `POST /api/admin/loans/{loan_id}/approve` - Approve loan (admin only)
- `GET /api/admin/dashboard` - Dashboard statistics (admin only)
- `GET /api/admin/penalties` - Late payment overview (admin only)

### Member Operations
- `GET /api/member/profile/{phone}` - Get member profile
- `GET /api/member/loans/{phone}` - Get member's loans
- `GET /api/member/payments/{phone}` - Get member's payment history
- `POST /api/member/loans/request` - Request a loan

### Payment Operations
- `POST /api/payments/add` - Add a payment
- `GET /api/payments/history/{phone}` - Get payment history
- `GET /api/payments/member/{phone}` - Get recent payments

## Default Admin Credentials

- Phone: `1234567890`
- Password: `admin123`

**Important:** Change the admin password after first login!

## Security Notes

1. Change the `SECRET_KEY` in `.env` to a secure random string
2. Use HTTPS in production
3. Change default admin credentials
4. Keep dependencies updated
5. Never commit `.env` file to version control

## Technology Stack

- FastAPI - Web framework
- SQLAlchemy - ORM
- PostgreSQL - Database
- JWT - Authentication
- Bcrypt - Password hashing
- Pydantic - Data validation
