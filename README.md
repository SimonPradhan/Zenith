# Zenith

Zenith is a full-stack productivity application for managing notes and tasks in one place. It provides a focused workspace for creating and organizing tasks, writing notes, scheduling work, tracking progress, and managing account security.

The project is built with a FastAPI backend, PostgreSQL database, and Next.js frontend.

## Features

### Task Management

* Create, edit, and delete tasks
* Task descriptions
* Task status management

  * Pending
  * In Progress
  * Completed
  * Cancelled
* Task priority levels

  * Low
  * Medium
  * High
  * Urgent
* Start date and due date
* Estimated task duration
* Date validation to prevent invalid date ranges
* Search tasks
* Filter tasks by status and priority
* Pagination
* List and board views
* Task progress tracking
* Today and upcoming task grouping
* Overdue task detection
* Direct navigation from dashboard to individual tasks

### Notes

* Create, edit, and delete notes
* Sticky-note inspired interface
* Multiple note colors

  * Yellow
  * Purple
  * Blue
  * Green
  * Pink
* Recent notes displayed on the dashboard
* Note search/list management
* Responsive note board
* Visual paper texture and folded-corner styling

### Dashboard

The dashboard provides an overview of the user's productivity.

* Total tasks
* Pending tasks
* Completed tasks
* Total notes
* Task completion rate
* Overdue tasks
* Today's tasks
* Upcoming tasks
* Recent notes
* Task progress overview
* Quick actions for creating tasks and notes

### Authentication and Security

* User registration
* User login
* JWT-based authentication
* Password hashing using Argon2
* Email verification
* Password reset flow
* Protected API endpoints
* Authentication-aware frontend routing
* Rate limiting for API protection
* Environment-based secret configuration

### API

The backend exposes a REST API with automatic OpenAPI documentation.

Available API documentation during development:

```text
http://127.0.0.1:8000/docs
```

Alternative OpenAPI documentation:

```text
http://127.0.0.1:8000/redoc
```

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Lucide React
* Next.js App Router

### Backend

* Python 3.11
* FastAPI
* SQLAlchemy
* Pydantic
* Pydantic Settings
* Alembic
* PyJWT
* Argon2
* SlowAPI
* Resend

### Database

* PostgreSQL
* Neon PostgreSQL for production

### Deployment

* Vercel for the frontend
* Render for the backend
* Neon for the production database

## Project Architecture

Zenith follows a layered backend architecture:

```text
Frontend
   |
   v
API Routers
   |
   v
Services
   |
   v
Repositories
   |
   v
SQLAlchemy Models
   |
   v
PostgreSQL
```

### Backend Responsibilities

**Routers**

Handle HTTP requests, authentication dependencies, request validation, and responses.

**Services**

Contain application and business logic.

**Repositories**

Handle database operations and queries.

**Models**

Define the database structure using SQLAlchemy.

**Schemas**

Define request and response validation using Pydantic.

## Project Structure

```text
Zenith/
│
├── backend/
│   │
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── note.py
│   │   │   └── task.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── note.py
│   │   │   └── task.py
│   │   │
│   │   ├── repositories/
│   │   │   ├── note_repository.py
│   │   │   └── task_repository.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── note_service.py
│   │   │   └── task_service.py
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── notes.py
│   │   │   └── tasks.py
│   │   │
│   │   └── main.py
│   │
│   ├── alembic/
│   │   └── versions/
│   │
│   ├── tests/
│   │
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env
│
├── frontend/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   ├── notes/
│   │   │   ├── register/
│   │   │   ├── reset-password/
│   │   │   ├── settings/
│   │   │   ├── tasks/
│   │   │   └── verify-email/
│   │   │
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   └── auth/
│   │   │
│   │   └── types/
│   │
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   └── .env.local
│
└── README.md
```

## Prerequisites

Before running Zenith locally, install the following:

* Git
* Python 3.11+
* Node.js
* npm
* PostgreSQL

Verify the installations:

```bash
git --version
python --version
node --version
npm --version
psql --version
```

## Clone the Repository

```bash
git clone https://github.com/SimonPradhan/Zenith.git
cd Zenith
```

The repository contains separate frontend and backend applications.

## Backend Setup

Move into the backend directory:

```bash
cd backend
```

### Create a Virtual Environment

Windows:

```bash
python -m venv .venv
```

Activate it in Git Bash:

```bash
source .venv/Scripts/activate
```

Or in Windows Command Prompt:

```cmd
.venv\Scripts\activate
```

### Install Dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/zenith

JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

FRONTEND_URL=http://localhost:3000

RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=your-verified-email@example.com
```

Do not commit `.env` files or production secrets to Git.

### Database Setup

Create a PostgreSQL database named `zenith`.

For example:

```sql
CREATE DATABASE zenith;
```

Make sure the `DATABASE_URL` in `.env` points to the correct database.

### Run Migrations

Apply all database migrations:

```bash
alembic upgrade head
```

Check the current migration:

```bash
alembic current
```

Check whether the database is synchronized with the models:

```bash
alembic check
```

### Start the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

Alternative documentation:

```text
http://127.0.0.1:8000/redoc
```

Health check:

```text
http://127.0.0.1:8000/health
```

## Frontend Setup

Open another terminal and move to the frontend:

```bash
cd Zenith/frontend
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create:

```text
frontend/.env.local
```

For local development:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

For production, configure the environment variable with the deployed backend URL.

Example:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url
```

### Start the Frontend

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

## Running the Complete Application

You need two terminal sessions.

### Terminal 1 — Backend

```bash
cd Zenith/backend
source .venv/Scripts/activate
alembic upgrade head
uvicorn app.main:app --reload
```

### Terminal 2 — Frontend

```bash
cd Zenith/frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Database Migrations

Zenith uses Alembic for database schema management.

Create a new migration after changing SQLAlchemy models:

```bash
alembic revision --autogenerate -m "describe your change"
```

Review the generated migration before applying it.

Apply migrations:

```bash
alembic upgrade head
```

Rollback one migration:

```bash
alembic downgrade -1
```

Show migration history:

```bash
alembic history
```

Show the current migration:

```bash
alembic current
```

Check for model changes that have not been migrated:

```bash
alembic check
```

## API Endpoints

### Authentication

```text
POST /auth/register
POST /auth/login
GET  /auth/verify-email
POST /auth/forgot-password
POST /auth/reset-password
```

### Notes

```text
GET    /notes/
POST   /notes/
GET    /notes/{note_id}
PATCH  /notes/{note_id}
DELETE /notes/{note_id}
```

### Tasks

```text
GET    /tasks/
POST   /tasks/
GET    /tasks/{task_id}
PATCH  /tasks/{task_id}
DELETE /tasks/{task_id}
```

The exact request parameters, response schemas, authentication requirements, and validation rules are available through the generated OpenAPI documentation.

## Task Query Features

The task API supports filtering and scheduling-related queries.

Examples include:

```text
GET /tasks/?status=pending
```

```text
GET /tasks/?priority=high
```

```text
GET /tasks/?due_from=2026-10-07T00:00:00
```

```text
GET /tasks/?due_to=2026-10-07T23:59:59
```

```text
GET /tasks/?order_by_due_date=true
```

These parameters are used by the dashboard to retrieve upcoming and overdue tasks efficiently.

## Testing

Backend tests can be run using:

```bash
cd backend
pytest
```

For more detailed output:

```bash
pytest -v
```

## Frontend Production Build

To verify the frontend before deployment:

```bash
cd frontend
npm run build
```

Run the production build locally:

```bash
npm run start
```

## Production Deployment

Zenith is designed to deploy the frontend and backend independently.

### Frontend

The Next.js frontend can be deployed to Vercel.

Configure the following environment variable in the deployment platform:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url
```

Build command:

```bash
npm run build
```

### Backend

The FastAPI backend can be deployed to Render or another Python-compatible hosting platform.

Recommended build/setup process:

```bash
pip install -r requirements.txt
alembic upgrade head
```

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

The production database can be hosted using Neon PostgreSQL or another managed PostgreSQL provider.

### Production Environment

Never commit production secrets to the repository.

Configure sensitive values through the hosting provider's environment-variable system:

```env
DATABASE_URL=
JWT_SECRET_KEY=
JWT_ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
FRONTEND_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

## Email Configuration

Zenith uses Resend for transactional email functionality.

Email functionality is used for account-related workflows such as:

* Email verification
* Password reset

A verified sending domain or email address is required for production email delivery.

Configure:

```env
RESEND_API_KEY=your-api-key
RESEND_FROM_EMAIL=your-verified-sender
```

## Security Considerations

The following security practices are implemented:

* Passwords are never stored as plain text.
* Password hashing uses Argon2.
* Authentication uses signed JWT tokens.
* Sensitive configuration is stored in environment variables.
* Protected endpoints require authentication.
* API requests can be rate limited.
* CORS is configured for approved frontend origins.
* Database operations use SQLAlchemy rather than manually constructed SQL queries.
* Password reset and email verification use time-sensitive tokens.

For production deployment, use a strong randomly generated JWT secret and never expose backend secrets through frontend environment variables.

## Development Workflow

A typical development workflow is:

```text
1. Create or modify SQLAlchemy models
          |
          v
2. Generate an Alembic migration
          |
          v
3. Review the migration
          |
          v
4. Apply the migration
          |
          v
5. Update schemas/services/repositories
          |
          v
6. Update API routes
          |
          v
7. Update frontend API clients
          |
          v
8. Update frontend components
          |
          v
9. Run backend tests
          |
          v
10. Run frontend production build
```

Before committing changes:

```bash
# Backend
pytest
alembic check

# Frontend
npm run build
```

## Health Checks

Backend health endpoint:

```text
GET /health
```

The endpoint can be used to verify that the FastAPI application is running.

Database connectivity can also be checked through the application's database test endpoint during development.

## Common Issues

### Backend cannot connect to PostgreSQL

Check:

1. PostgreSQL is running.
2. The database exists.
3. `DATABASE_URL` is correct.
4. The PostgreSQL username and password are correct.
5. The configured port is correct.

Example local connection:

```env
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/zenith
```

### Migration errors

Check the current migration:

```bash
alembic current
```

Then check migration history:

```bash
alembic history
```

If the database is behind the application schema:

```bash
alembic upgrade head
```

### Frontend cannot connect to backend

Check:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Then verify that the backend is running:

```text
http://127.0.0.1:8000/health
```

Also verify the backend CORS configuration allows the frontend origin.

### Frontend build fails

Run:

```bash
npm run build
```

Fix TypeScript or lint/build errors before deploying.

## Design Philosophy

Zenith is designed around a simple principle:

> Keep tasks actionable and notes accessible without adding unnecessary complexity.

The interface focuses on:

* Clear information hierarchy
* Fast task creation
* Easy task status tracking
* Visual distinction between priorities
* Practical dashboard information
* Responsive layouts
* Consistent dark interface
* Minimal visual clutter

## Future Improvements

Potential future improvements include:

* Calendar integration
* Recurring tasks
* Task reminders
* Browser notifications
* Drag-and-drop task organization
* Advanced task analytics
* Note pinning
* Note categories
* File attachments
* Team collaboration
* Shared workspaces
* OAuth authentication
* Mobile application

## License

This project currently does not specify a public open-source license.

If the repository is intended to be distributed publicly, add an appropriate license such as MIT before treating the project as open source.

## Author

Simon Pradhananga

GitHub:

https://github.com/SimonPradhan

Project:

https://github.com/SimonPradhan/Zenith
