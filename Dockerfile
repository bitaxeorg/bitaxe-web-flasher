# Use the official Node.js LTS image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the default Next.js port
EXPOSE 3000

# Command to run the development server
CMD ["npm", "run", "dev"]
