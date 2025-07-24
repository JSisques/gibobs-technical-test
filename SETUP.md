# Setup Guide

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
JWT_EXPIRES_IN=1h

# Server Configuration
PORT=3000

# Database Configuration (if needed)
DATABASE_URL=sqlite:./db/db.sqlite
```

### Important Notes:

1. **JWT_SECRET**: This should be a long, secure random string. You can generate one using:

    ```bash
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    ```

2. **JWT_EXPIRES_IN**: Default is 1 hour. You can use formats like:

    - `1h` (1 hour)
    - `7d` (7 days)
    - `30m` (30 minutes)

3. **PORT**: The port where the server will run (default: 3000)

## Running the Application

1. Install dependencies:

    ```bash
    yarn install
    ```

2. Run migrations:

    ```bash
    yarn migrations:run
    ```

3. Start the development server:

    ```bash
    yarn start:dev
    ```

4. Access the Swagger documentation at:
    ```
    http://localhost:3000/docs
    ```

## API Endpoints

### Authentication

-   `POST /api/v1/auth/register` - Register a new user
-   `POST /api/v1/auth/login` - Login user

### Users

-   `GET /api/v1/users/:id` - Get user by ID
-   `PATCH /api/v1/users/:id` - Update user
-   `PATCH /api/v1/users/:id/email` - Update user email
-   `DELETE /api/v1/users/:id` - Delete user

### Tasks

-   `GET /api/v1/tasks` - List user tasks (paginated)
-   `GET /api/v1/tasks/:id` - Get task by ID
-   `POST /api/v1/tasks` - Create new task
-   `PATCH /api/v1/tasks/:id` - Update task

## Authentication

Most endpoints require authentication using JWT Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

You can get a token by registering or logging in through the auth endpoints.
