# Magic the Gathering Pod Pairing App

A MERN stack application to pair Magic the Gathering players into pods of 4 players.

## Features

- Player profiles with first/last name, email, and 4-digit PIN authentication
- Queue system for players ready to be paired
- Pod assignment algorithm that considers previous pairings and player ratings
- Pod confirmation system with 2-minute timeout
- Match history tracking for confirmed pods
- Private player rating system
- Mobile-responsive design

## Tech Stack

- MongoDB for database
- Express.js for backend API
- React for frontend
- Node.js for server runtime

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## Installation

1. Clone the repository

```
git clone <repository-url>
cd mtg-pod-pairer
```

2. Install dependencies for server, client, and root

```
npm run install-all
```

3. Create a `.env` file in the server directory with the following variables:

```
PORT=9000
MONGODB_URI=******
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## Running the Application

### Development Mode

To run both the server and client concurrently:

```
npm run dev
```

The server will run on http://localhost:9000 and the client on http://localhost:3000.

### Server Only

```
npm run server
```

### Client Only

```
npm run client
```

### Production Mode

```
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepin` - Update user PIN

### Queue Management

- `PUT /api/queue/join` - Join the queue
- `PUT /api/queue/leave` - Leave the queue
- `PUT /api/queue/ready` - Ready for next game
- `PUT /api/queue/finish` - Finish playing
- `GET /api/queue/status` - Get queue status

### Pod Management

- `GET /api/pods/current` - Get current pod for user
- `PUT /api/pods/:id/confirm` - Confirm pod assignment
- `PUT /api/pods/:id/reject` - Reject pod assignment
- `GET /api/pods/history` - Get pod history for user
- `POST /api/pods/:podId/rate/:playerId` - Rate a player
- `GET /api/pods/ratings/:playerId` - Get ratings for a player

### Admin

- `POST /api/admin/create-pods` - Manually trigger pod creation
- `POST /api/admin/handle-timeouts` - Manually handle pod timeouts

## Pod Assignment Algorithm

The pod assignment algorithm considers the following factors:

- Previous pairings (avoids pairing players who recently played together)
- Player ratings (prioritizes pairing with highly-rated players)
- Prevents more than 3 players who just played together from being assigned to the same pod

## License

MIT
