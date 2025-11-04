# Expense Management System with Portfolio Manager

A comprehensive web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that helps users manage their expenses and portfolio investments efficiently.

## Features

### Expense Management
- Track daily, weekly, and monthly expenses
- Categorize expenses
- Generate expense reports and analytics
- Set budgets and receive alerts

### Portfolio Management
- Track investment portfolios
- Monitor asset performance
- View portfolio analytics
- Real-time investment tracking

### User Management
- Secure user authentication
- Role-based access control (User/Admin)
- Personal profile management
- Secure data handling

### File Management
- Upload and store important documents
- Secure file storage using AWS S3
- Easy file retrieval and management

## Technology Stack

### Frontend
- React.js
- Ant Design Components
- Axios for API requests
- React Router for navigation

### Backend
- Node.js
- Express.js
- AWS DynamoDB for database
- AWS S3 for file storage

### Security
- JWT Authentication
- Encrypted password storage
- Secure file handling
- Protected API routes

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- AWS Account credentials
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/hitenbhurani/Expense-Management-System.git
cd Expense-Management-System
```

2. Install server dependencies
```bash
npm install
```

3. Install client dependencies
```bash
cd client
npm install
```

4. Set up environment variables
- Create a `.env` file in the root directory
- Copy the contents from `.env.example`
- Fill in your AWS credentials and other configuration

5. Initialize DynamoDB tables
```bash
npm run setup-tables
```

### Running the Application

1. Start the backend server
```bash
npm run server
```

2. Start the frontend application
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   └── config/       # Frontend configuration
├── config/                # Backend configuration
├── controllers/          # Request handlers
├── models/              # Data models
├── routes/             # API routes
├── scripts/           # Utility scripts
└── utils/            # Helper functions
```

## Environment Variables

Required environment variables:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_REGION`: AWS region for services
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 8080)

## API Documentation

The API endpoints are organized into the following categories:

- `/api/v1/users` - User management
- `/api/v1/expenses` - Expense operations
- `/api/v1/portfolio` - Portfolio management
- `/api/v1/files` - File operations
- `/api/v1/admin` - Admin functions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Hiten Bhurani - [hitenbhurani@gmail.com](mailto:hitenbhurani@gmail.com)

Project Link: [https://github.com/hitenbhurani/Expense-Management-System](https://github.com/hitenbhurani/Expense-Management-System)
