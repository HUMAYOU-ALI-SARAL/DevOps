# Base image
FROM node:18.18.0

# Create app directory
WORKDIR /usr/src/app

# Copy the .env file
COPY .env .env

# Create backend directory
WORKDIR /usr/src/app/backend

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# Copy package.json and package-lock.json
COPY ./backend/package.json ./package-lock.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY ./backend/ ./

# Creates a "dist" folder with the production build
RUN npm run build

# Expose the port on which the app will run
ENV API_PORT=3000
EXPOSE $API_PORT

# Start the server using the production build
CMD ["npm", "run", "start:prod"]