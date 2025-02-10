FROM node:21 as builder

# Set environment variables

ENV NODE_ENV=development

ARG NEXT_PUBLIC_BUILD_ENV=server

# Set working directory

WORKDIR /opt/debuglife/debuglife-frontend

# Install packages

COPY ./debuglife-frontend/package.json ./package.json
COPY ./debuglife-frontend/package-lock.json ./package-lock.json

RUN npm install

FROM node:21 as production

ENV NODE_ENV=production

WORKDIR /opt/debuglife/debuglife-frontend

COPY --from=builder /opt/debuglife/debuglife-frontend/node_modules ./node_modules

# Build project

COPY ./debuglife-frontend/ .

RUN npx next build

# Expose port

EXPOSE 3000

# Start server

CMD ["npx", "next", "start"]