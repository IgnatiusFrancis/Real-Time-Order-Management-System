# Order Management System API Documentation

A real-time order management system built with NestJS, featuring WebSocket-based chat functionality and role-based access control.

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
- Prisma: For ORM with PostgreSQL.
- PostgreSQL: Database for storing data.

# Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/IgnatiusFrancis/Checkit.git

   ```

# Install dependencies:

npm install

# Configuration

Create a .env file in the root directory and configure the following environment variables:

```env
DATABASE_URL="postgres://user:password@host:port/dbname"
PORT="2025"
JWT_SECRET="your_jwt_secret_key"

```

# Usage

## Starting the Server

To start the API server, run the following command:

```bash
# Development mode (auto-restarts on file changes)
$ npm run start:dev

# Production mode
$ npm run start:prod

```

## Testing

Testing can be done through the terminal. Implemented integration and unit tests.

```bash
# unit tests
$ npm run test auth.service.spec.ts

# e2e tests
$ npm run test:e2e
```

```bash

## Contributing

To contribute to this project, please follow these guidelines:

- Fork the repository.
- Create a feature branch (git checkout -b feature/your-feature).
- Commit your changes (git commit -am 'Add new feature').
- Push to the branch (git push origin feature/your-feature).
- Open a pull request.
  ...

...

## Contact

For any inquiries, please reach out to:

- **Name: Ignatius Francis**
- **Email: obiignatiusfrancis@outlook.com**
- **GitHub: IgnatiusFrancis**
  ...
```
