# URL Shortener Project - Setup Guide

This guide will walk you through setting up and running the URL shortener backend project.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16.x or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) (local installation or MongoDB Atlas account)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd url-shortener-be
```

### 2. Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=8081
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/url-shortener
# OR use MongoDB Atlas
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/url-shortener

# Rate Limiter
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Optional: For production deployment
# BASE_URL=use localhost
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

### 4. Database Setup

Ensure your MongoDB server is running if using a local installation. If you're using MongoDB Atlas, make sure you've configured the correct connection string in the `.env` file.

### 5. Build the Project

Compile TypeScript files to JavaScript:

```bash
npm run build
# or
yarn build
```

### 6. Run the Server

#### For Development

```bash
npm run dev
# or
yarn dev
```

This will start the server using nodemon, which automatically restarts the server when you make changes to the code.

#### For Production

```bash
npm start
# or
yarn start
```

The server should now be running on the specified port (default: 8081).

## API Endpoints

The URL shortener API provides the following endpoints:

### URL Operations

- **Create Short URL**: `POST /v1/api/url/encode`
  - Request body: `{ "url": "https://example.com" }`
  - Returns a shortened URL

- **Decode Short URL**: `GET /v1/api/url/decode/:shortUrl`
  - Returns the original URL information

- **Get URL Statistics**: `GET /v1/api/url/statistics/:shortUrl`
  - Returns statistics about URL usage

- **Get All URLs**: `GET /v1/api/url/all`
  - Returns all shortened URLs in the database

- **Search URLs**: `GET /v1/api/url/search?query=searchTerm`
  - Search URLs by original URL content

- **Redirect to Original URL**: `GET /v1/api/url/redirect/:shortUrl`
  - Redirects to the original URL and logs visit statistics

## Project Structure

```
url-shortener-be/
├── src/
│   ├── config/         # Database and server configurations
│   ├── controllers/    # Request handlers
│   ├── errors/         # Error handling utilities
│   ├── helpers/        # Helper functions
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   └── views/          # EJS templates (if used)
├── app.ts              # Main application file
├── package.json        # Project dependencies
└── tsconfig.json       # TypeScript configuration
```

## Testing

To run tests:

```bash
npm test
# or
yarn test
```

For continuous testing during development:

```bash
npm run test:watch
# or
yarn test:watch
```

To generate test coverage reports:

```bash
npm run test:coverage
# or
yarn test:coverage
```

## Deployment

For deployment to platforms like Render, Heroku, or similar services:

1. Ensure your environment variables are set in the deployment platform
2. The `postinstall` script will build the TypeScript automatically
3. The service will use `npm start` to run the application

## Troubleshooting

1. **Connection Issues**:
   - Verify MongoDB connection string
   - Check if MongoDB service is running
   - Ensure network allows connections to database

2. **Build Errors**:
   - Check TypeScript errors with `tsc --noEmit`
   - Ensure all dependencies are installed

3. **Runtime Errors**:
   - Check the logs for detailed error messages
   - Verify environment variables are set correctly