# Order Management System

A real-time order management system built with NestJS, featuring WebSocket-based chat functionality, role-based access control, and comprehensive test coverage.

# Overview

This project implements a robust order management system with real-time chat capabilities, allowing seamless communication between admin users and regular users regarding their orders.

## Table of Contents

- [Key Features](#key-features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Starting the Server](#starting-the-server)
  - [API Endpoints](#api-endpoints)
- [Documentation](#documentation)
  - [API Documentation](#api-documentation)
- [Testing](#testing)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
- [WebSocket Testing Guide](#webSocket-testing-guide)
- [Technical Implementation](#technical-implementation)
- [Nice-to-Have Features (Planned)](#nice-to-have-features-planned)
- [Development Challenges](#development-challenges)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

# Key-Features

- Role-based user management (Admin and User)
- Order creation and management with state transitions
- Real-time chat system using WebSockets
- Comprehensive test coverage (Unit and Integration tests)
- API documentation (Swagger and Postman)
- Input validation and error handling for both HttpException and WsException
- Persistent chat history
- Admin-controlled chat room closure with summary messages

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
SWAGGER_DOC_DESCRIPTION=Checkit API Documentation
SWAGGER_DOC_TITLE=Checkit
SWAGGER_DOC_VERSION=1.0
SWAGGER_MODELS_EXPAND_DEPTH=-1
SWAGGER_PATH=documentation
SWAGGER_SITE_TITLE=API Docs

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

# Documentation

## API Documentation

Swagger UI: Access the Swagger documentation at http://localhost:2025/documentation#/

Postman Collection: Link to Postman Collection [API Documentation](https://www.postman.com/planetary-trinity-671710/checkit/documentation/ke2mwnl/checkit?workspaceId=d620d662-3204-4e2f-925a-f7ba8b7e80c7)

Note: Postman is recommended for WebSocket testing due to better WebSocket support compared to Swagger

## Testing

The project includes comprehensive test coverage:

## Unit Tests

Located within each module directory:

```bash
# Auth Tests
npm run test auth.service.spec.ts
npm run test auth.controller.spec.ts

# Order Tests
npm run test order.service.spec.ts
npm run test order.controller.spec.ts

# Chat Tests
npm run test chat.service.spec.ts
npm run test chat.controller.spec.ts
npm run test chat.gateway.spec.ts

```

## integration Tests

Located in the test folder with separate directories for each module:

```bash
# This runs all the tests in test folder
npm run test:e2e

```

## WebSocket Testing Guide

This system features a WebSocket-based chat functionality for real-time communication. Follow the steps below to connect and interact with the WebSocket server.

Prerequisites
Ensure the server is running and that you have a valid JWT token for authorization.

Steps to Test WebSocket

1.  Connect to the WebSocket Server through localhost:2025/api/v1/chat as documented in postman and provide Authorization: Bearer <your_jwt_token> in the header section.

2.  Supported Events
    The system listens for the following events:
    . message: Used to handle real-time chat messages.
    . error: Used to handle any WsException errors.

3.  Sending a Chat Message
    To send a message:
    . Click on the "Messages" tab in Postman.
    . Ensure that the payload format is set to JSON.
    . In the Field input box, type sendMessage. This is the event name the server listens for.

## Technical Implementation

Core Requirements Implemented

1.  User Management:
    . Admin and Regular user roles
    . JWT-based authentication
    . Role-based access control

2.  Order Management:
    . Order creation with metadata
    . State transitions (Review → Processing → Completed)
    . Input validation

3.  Chat System:
    . Real-time WebSocket communication
    . Automatic chat room creation per order
    . Persistent message storage
    . Admin-controlled room closure
    . Chat history visibility etc

## Nice-to-Have Features (Planned)

1.  Docker Integration:
    . Containerization for easy deployment
    . Docker Compose for service orchestration
    . Scaling Solutions:

2.  Redis implementation for caching
    . Bull Queue for handling chat messages
    . Horizontal scaling capabilities

## Development Challenges

1.  Time Management:
    . Met tight deadlines during festive period
    . Balanced feature implementation with testing requirements

2.  Technical Challenges:
    . Implementing real-time WebSocket communication
    . Ensuring proper state management across the system
    . Maintaining test coverage while adding features

## Contributing

To contribute to this project, please follow these guidelines:

- Fork the repository.
- Create a feature branch (git checkout -b feature/your-feature).
- Commit your changes (git commit -m 'Add new feature').
- Push to the branch (git push origin feature/your-feature).
- Open a pull request.

## Contact

For any inquiries, please reach out to:

- **Name: Ignatius Francis**
- **Email: obiignatiusfrancis@outlook.com**
- **GitHub: IgnatiusFrancis**

```

```
