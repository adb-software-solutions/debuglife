FROM node:19

# Set environment variables

ENV NODE_ENV=development

# Set working directory

WORKDIR /opt/extremeukdeals/extremeukdeals-frontend

# Install packages

COPY ./extremeukdeals-frontend/package.json ./package.json
COPY ./extremeukdeals-frontend/package-lock.json ./package-lock.json

RUN npm ci

# Expose port

EXPOSE 3000

# Start server

# Run next dev --experimental-https

CMD ["npx", "next", "dev"]