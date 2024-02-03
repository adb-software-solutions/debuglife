FROM node:21 as builder

# Set environment variables

ENV NODE_ENV=development

# Set working directory

WORKDIR /opt/extremeukdeals/extremeukdeals-frontend

# Install packages

COPY ./extremeukdeals-frontend/package.json ./package.json
COPY ./extremeukdeals-frontend/package-lock.json ./package-lock.json

RUN npm install

FROM node:21 as production

ENV NODE_ENV=production

WORKDIR /opt/extremeukdeals/extremeukdeals-frontend

COPY --from=builder /opt/extremeukdeals/extremeukdeals-frontend/node_modules ./node_modules

# Build project

COPY ./extremeukdeals-frontend/ .

RUN npx next build

# Expose port

EXPOSE 3000

# Start server

CMD ["npx", "next", "start"]