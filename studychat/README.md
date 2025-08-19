# Study Chat - Real-time Academic Collaboration Platform

A comprehensive real-time chat application built with React, Node.js, Socket.io, and PHP, designed for academic collaboration and study groups.

## Features

- **Real-time Messaging**: Instant messaging with Socket.io WebSocket connections
- **User Authentication**: Secure login/registration with JWT tokens
- **Multiple Chat Rooms**: Organized by academic subjects (Math, CS, Physics, etc.)
- **User Presence**: See who's online in each room
- **Typing Indicators**: Real-time typing status
- **Room Management**: Create and join study rooms
- **Emoji Support**: Enhanced messaging with emoji picker
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router v6** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications
- **Emoji Picker React** - Emoji support
- **Lucide React** - Modern icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.io** - Real-time WebSocket server
- **PHP** - REST API backend
- **MySQL** - Database

## Project Structure

```
studychat/
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/         # Login/Register components
│   │   │   ├── Chat/         # Chat room components
│   │   │   ├── Dashboard/    # Dashboard and room management
│   │   │   └── UI/           # Reusable UI components
│   │   ├── contexts/         # React contexts (Auth, Socket)
│   │   └── App.js
│   └── package.json
├── chat-server/              # Node.js Socket.io server
│   ├── server.js
│   └── package.json
├── php/                      # PHP REST API
│   ├── config.php
│   ├── login.php
│   ├── register.php
│   ├── get_rooms.php
│   └── create_room.php
└── db_schema.sql            # Database schema
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PHP (v7.4 or higher)
- MySQL
- WAMP/XAMPP (for local development)

### Database Setup
1. Create a MySQL database named `studychat_db`
2. Import the database schema:
   ```sql
   mysql -u root -p studychat_db < db_schema.sql
   ```

### Backend Setup (PHP API)
1. Copy the `php/` folder to your web server directory (e.g., `htdocs/studychat/php/`)
2. Update database credentials in `php/config.php` if needed
3. Ensure your web server is running (Apache/Nginx)

### Chat Server Setup
1. Navigate to the chat server directory:
   ```bash
   cd chat-server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3001`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The app will run on `http://localhost:3000`

## Configuration

### Environment Variables
Update the following configurations as needed:

**Frontend (`frontend/src/contexts/AuthContext.js`)**:
```javascript
axios.defaults.baseURL = 'http://localhost/studychat/php';
```

**Frontend (`frontend/src/contexts/SocketContext.js`)**:
```javascript
const newSocket = io('http://localhost:3001');
```

**PHP (`php/config.php`)**:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'studychat_db');
```

## Usage

1. **Register/Login**: Create an account or log in with existing credentials
2. **Browse Rooms**: View available study rooms organized by subject
3. **Join Room**: Click "Join Room" to enter a chat room
4. **Chat**: Send messages, use emojis, see typing indicators
5. **Create Room**: Create new study rooms for specific subjects
6. **User Presence**: See who's online in each room

## API Endpoints

### Authentication
- `POST /login.php` - User login
- `POST /register.php` - User registration

### Rooms
- `GET /get_rooms.php` - Get all rooms (with optional subject filter)
- `POST /create_room.php` - Create new room (requires authentication)

### WebSocket Events
- `user_connect` - Connect user to server
- `join_room` - Join a chat room
- `send_message` - Send message to room
- `typing_start/stop` - Typing indicators

## Development

### Running in Development Mode
1. Start the database server (MySQL)
2. Start the web server (Apache/Nginx)
3. Start the chat server: `cd chat-server && npm run dev`
4. Start the frontend: `cd frontend && npm start`

### Building for Production
```bash
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
