# SAAS API Documentation

This is a subscription-based application using Paystack, BullMQ, and NestJS modular architecture.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Starting the Server](#starting-the-server)
  - [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

# Prerequisites

- Node.js: Ensure you have Node.js installed (version 14.x or higher recommended)
- NestJS: Familiarity with the NestJS framework.
- TypeScript: Knowledge of TypeScript.
- Paystack: For payment and subscription management.
- Prisma: For ORM with PostgreSQL.
- PostgreSQL: Database for storing data.
- Cloudinary: For image hosting and management.
- Redis: Used for BullMQ (task queue management). You need to have Redis installed locally or set up a Redis cloud instance.

# Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/IgnatiusFrancis/SAAS.git

   ```

2. Redis Setup:

Local Redis: If you want to run Redis locally, ensure Redis is installed and running.
Redis Cloud: Alternatively, set up a Redis cloud instance and configure the connection details in your .env file.

# Install dependencies:

npm install


# Configuration

Create a .env file in the root directory and configure the following environment variables:

```env
DATABASE_URL="postgres://user:password@host:port/dbname"
PAYSTACK_SECRETKEY="your_paystack_secret_key"
PAYSTACK_BASEURL="https://api.paystack.co"
PORT="3000"
CLOUDINARY_NAME="your_cloudinary_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
JWT_SECRET="your_jwt_secret_key"
REDIS_PASSWORD="your_redis_password"
REDIS_HOST="localhost" # Or your Redis cloud instance host
REDIS_PORT="6379" # Or your Redis cloud instance port
NODE_ENV="" # development by default

````

# Usage

## Starting the Server

To start the API server, run the following command:

```bash
# Development mode (auto-restarts on file changes)
$ npm run start:dev

# Production mode
$ npm run start:prod

```

The API will be accessible at [API](https://taskass-zc54.onrender.com)

## API Endpoints

### Sign Up

- **URL**: /auth/signup
- **Method**: POST
- **Request Body**: `{ "email": "user@example.com", "password": "your_password" }`
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2sA3kUHhaE)

### Sign In

- **URL**: /auth/signin
- **Method**: POST
- **Request Body**: `{ "email": "user@example.com", "password": "your_password" }`
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2sA3kUHhaE)

### Create subscription

- **URL**: /subscription
- **Method**: POST
- **Request Body**: `{ "amount": "5000", "plan": "Plan_Grtahahgst" }`
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2sA3kUHhaE)

### Cancel subscription

- **URL**: /subscription/cancel/subscriptionId
- **Method**: POST
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2sA3kUHhaE)

 ### Get All user subscriptions

- **URL**: /subscription
- **Method**: GET
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2sA3kUHhaE)

### Upload file

- **URL**: /image/upload
- **Method**: POST
- **Response**: Detailed response information is available in the [API Documentation](https://documenter.getpostman.com/view/19595090/2sA3kUHhaE)

...

## Testing

Testing can be done through the terminal. Implemented integration and unit tests.

```bash
# unit tests
$ npm run test auth.service.spec.ts

# e2e tests
$ npm run test:e2e
```

...

```bash

```

## Contributing

To contribute to this project, please follow these guidelines:

- Fork the repository.
- Create a feature branch (git checkout -b feature/your-feature).
- Commit your changes (git commit -am 'Add new feature').
- Push to the branch (git push origin feature/your-feature).
- Open a pull request.
  ...

## License

...

## Contact

For any inquiries, please reach out to:

- **Name: Ignatius Francis**
- **Email: obiignatiusfrancis@outlook.com**
- **GitHub: IgnatiusFrancis**
  ...

Feel free to explore the API and refer to the [API Documentation](https://documenter.getpostman.com/view/19595090/2sA3kUHhaE) for detailed information on each endpoint and their functionalities.
