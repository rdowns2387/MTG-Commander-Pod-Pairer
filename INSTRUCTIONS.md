# MTG Pod Pairer - Instructions

## Overview

This application helps Magic the Gathering players form pods of 4 players for games. It features:

- User authentication with email and 4-digit PIN
- Queue system for players ready to be paired
- Smart pod assignment algorithm
- Pod confirmation system with 2-minute timeout
- Match history tracking
- Player rating system
- Mobile-responsive design

## Running the Application

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Option 1: Running Locally

1. Start MongoDB:

```
./start-mongodb.sh
```

2. Install dependencies and start the application:

```
./run.sh
```

This will start both the backend server and the React frontend in development mode.

### Option 2: Using Docker

1. Build and start the application with Docker Compose:

```
docker-compose up
```

This will start both the application and MongoDB in Docker containers.

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:9000

## Testing

To run automated tests:

```
./run-tests.sh
```

## User Guide

1. **Registration/Login**:

   - Register with your first name, last name, email, and a 4-digit PIN
   - Login using your email and PIN

2. **Joining the Queue**:

   - On the dashboard, click "Join Queue" when you're ready to play
   - The system will automatically assign you to a pod when enough players are available

3. **Pod Confirmation**:

   - When assigned to a pod, you'll be redirected to the pod confirmation page
   - You have 2 minutes to confirm your spot in the pod
   - If all players confirm, the pod is formed and the game can begin
   - If any player rejects or fails to confirm within 2 minutes, all players are returned to the queue

4. **After a Game**:

   - Click "Ready for Next Game" to join the queue for another game
   - Click "Finish Playing" when you're done for the day
   - Rate other players you've played with in the Match History section

5. **Match History**:
   - View your past matches and the players you've played with
   - Rate players based on your experience playing with them

## Admin Features

The system automatically creates pods and handles timeouts, but admin endpoints are available for manual control:

- POST /api/admin/create-pods - Manually trigger pod creation
- POST /api/admin/handle-timeouts - Manually handle pod timeouts

## Troubleshooting

- If the application fails to connect to MongoDB, ensure MongoDB is running
- If the frontend can't connect to the backend, check that both are running and the proxy is set up correctly
- For any other issues, check the console logs for error messages
