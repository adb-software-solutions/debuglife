FROM node:21 as builder

# Set environment variables

ENV NODE_ENV=development

# Set working directory

WORKDIR /opt/epicbargainsanddeals/epicbargainsanddeals-frontend

# Install packages

COPY ./epicbargainsanddeals-frontend/package.json ./package.json
COPY ./epicbargainsanddeals-frontend/package-lock.json ./package-lock.json

RUN npm install

FROM node:21 as production

ENV NODE_ENV=production

WORKDIR /opt/epicbargainsanddeals/epicbargainsanddeals-frontend

COPY --from=builder /opt/epicbargainsanddeals/epicbargainsanddeals-frontend/node_modules ./node_modules

# Build project

COPY ./epicbargainsanddeals-frontend/ .

RUN npx next build

# Expose port

EXPOSE 3000

# Start server

CMD ["npx", "next", "start"]