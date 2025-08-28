# Plivo Mini Communication & Billing Platform

A full-stack mini communication platform that allows users to send messages and manage billing with credit-based system.

## Features

### 🔐 Authentication
- User signup and login with JWT tokens
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### 💬 Messaging
- Send text messages to other users
- Message history with sender/recipient details
- Real-time status tracking (sent, delivered, failed)
- Credit deduction per message (1 credit = 1 message)

### 💳 Billing System
- Users start with 100 credits
- Credit deduction for each message sent
- Insufficient balance protection
- Recharge functionality with transaction history
- Redis caching for balance lookups

### 🎨 Modern UI
- React frontend with Tailwind CSS
- Responsive design
- Clean and intuitive interface
- Real-time balance updates

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching layer for balance lookups
- **SQLAlchemy** - ORM for database operations
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Quick Start with Docker

1. **Clone and navigate to the project**
   ```bash
   cd TestCode2
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Manual Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database and Redis URLs:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/plivo_mini
   REDIS_URL=redis://localhost:6379
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Start the backend server**
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

### Database Setup

1. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE plivo_mini;
   ```

2. **Tables will be created automatically** when you start the backend server

## API Endpoints

### Authentication
- `POST /signup` - Create new user account
- `POST /token` - Login and get access token
- `GET /me` - Get current user profile

### Messaging
- `POST /send-message` - Send a message (costs 1 credit)
- `GET /messages` - Get message history

### Billing
- `GET /balance` - Get current credit balance
- `POST /recharge` - Add credits to account
- `GET /recharge-history` - Get recharge transaction history

## Usage

1. **Sign up** for a new account (starts with 100 credits)
2. **Login** to access the dashboard
3. **Send messages** to other users (1 credit per message)
4. **Monitor balance** in real-time
5. **Recharge credits** when needed
6. **View history** of messages and transactions

## Project Structure

```
TestCode2/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication logic
│   ├── database.py          # Database configuration
│   ├── redis_client.py      # Redis caching
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context
│   │   ├── services/        # API services
│   │   └── pages/           # Page components
│   ├── public/
│   └── package.json         # Node dependencies
└── docker-compose.yml       # Docker configuration
```

## Development

### Adding New Features

1. **Backend**: Add new endpoints in `main.py`, create models in `models.py`, and schemas in `schemas.py`
2. **Frontend**: Create components in `src/components/` and add API calls in `src/services/api.js`

### Testing

- Backend API documentation: http://localhost:8000/docs
- Test endpoints using the interactive Swagger UI
- Frontend testing: Use React Testing Library (setup included)

## Production Deployment

1. **Update environment variables** for production
2. **Use production database** and Redis instances
3. **Build frontend** for production: `npm run build`
4. **Use production WSGI server** like Gunicorn for backend
5. **Set up reverse proxy** (Nginx) for serving static files

## Security Considerations

- Change `SECRET_KEY` in production
- Use HTTPS in production
- Implement rate limiting
- Add input validation and sanitization
- Use environment variables for sensitive data

## License

This project is for educational purposes as part of the Plivo assignment.
