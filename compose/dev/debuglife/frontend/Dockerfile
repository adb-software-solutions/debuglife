# Use Ubuntu as the base image
FROM ubuntu:latest

# Set environment variables
ENV NODE_ENV=development

# Set working directory
WORKDIR /opt/debuglife/debuglife-frontend

# Install required dependencies
RUN apt update && apt install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_23.x | bash - && \
    apt install -y nodejs && \
    apt clean && rm -rf /var/lib/apt/lists/*

# Verify installation
RUN node -v && npm -v

# Copy package files
COPY ./debuglife-frontend/package.json ./package.json
COPY ./debuglife-frontend/package-lock.json ./package-lock.json

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Start the server
CMD ["npx", "next", "dev"]
