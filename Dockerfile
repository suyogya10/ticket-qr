FROM node:24.15.0-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose Next.js default port
EXPOSE 3000

# Set hostname to 0.0.0.0 to allow access from Windows 11 host
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Run Next.js in development mode
CMD ["npm", "run", "dev"]
