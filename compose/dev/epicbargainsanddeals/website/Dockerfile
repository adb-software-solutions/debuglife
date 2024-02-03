FROM node:19

# Set environment variables

ENV NODE_ENV=development

# Set working directory

WORKDIR /opt/vastdesk/vastdesk-website

# Install packages

COPY ./vastdesk-website/package.json ./package.json
COPY ./vastdesk-website/package-lock.json ./package-lock.json

RUN npm ci

# Expose port

EXPOSE 3001

# Start server

CMD ["npm", "run", "dev"]