# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm run install-all

# Copy the rest of the code
COPY . .

# Build the React app
RUN cd client && npm run build

# Expose port
EXPOSE 9000

# Start the server
CMD ["npm", "start"]