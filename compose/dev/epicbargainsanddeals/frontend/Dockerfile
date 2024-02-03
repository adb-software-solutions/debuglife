FROM node:19

# Set environment variables

ENV NODE_ENV=development

# Set working directory

WORKDIR /opt/epicbargainsanddeals/epicbargainsanddeals-frontend

# Install packages

COPY ./epicbargainsanddeals-frontend/package.json ./package.json
COPY ./epicbargainsanddeals-frontend/package-lock.json ./package-lock.json

RUN npm ci

# Expose port

EXPOSE 3000

# Start server

# Run next dev --experimental-https

CMD ["npx", "next", "dev"]