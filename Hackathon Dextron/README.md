# Discord Bot for Hackathon R-1

A comprehensive Discord bot built for Hackathon R-1 with features including user authentication, role management, channel management, message handling, and event management.

## Features

### User Authentication
- User registration and login
- JWT-based authentication
- Role-based access control
- User profile management

### Role Management
- Create, update, and delete roles
- Assign roles to users
- Permission-based role hierarchy
- Role-based access restrictions

### Channel Management
- Create and manage text/voice channels
- Channel category organization
- Private channel support
- Channel-specific permissions

### Message Handling
- Message creation and editing
- Message reactions and pinning
- Message search functionality
- Thread support

### Event Management
- Create and manage events
- Event participation tracking
- Recurring event support
- Event reminders

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Discord Developer Account

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
4. Configure your Discord bot token and other environment variables in `.env`

## Running the Bot

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Project Structure

```
├── src/
│   ├── commands/       # Discord bot commands
│   ├── handlers/       # Event and command handlers
│   ├── models/         # Database models
│   ├── services/       # Business logic services
│   ├── utils/          # Utility functions
│   └── index.js        # Main entry point
├── .env.example        # Example environment variables
├── package.json        # Project dependencies
└── README.md          # Project documentation
```

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Environment variable configuration
- Error logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License