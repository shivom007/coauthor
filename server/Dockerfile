# Use the official Node.js Alpine image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package.json
# Install project dependencies

RUN npm install
# Copy the source code to the container
COPY . .


# Expose the port on which your Node.js app will run
EXPOSE 8000

# Command to run your application
CMD ["node", "server.js"]
