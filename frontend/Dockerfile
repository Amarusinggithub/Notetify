# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.0
FROM node:${NODE_VERSION}-alpine

# Set environment explicitly (adjustable to 'production' or 'development' as needed)
ENV NODE_ENV=development

# Working directory for your app
WORKDIR /usr/src/app

# Install dependencies separately to leverage caching
COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy your app's source code into the container
COPY . .

# Ensure the non-root user owns the files
RUN chown -R node:node /usr/src/app

# Switch to non-root user for security
USER node

# Expose necessary ports (e.g., Vite dev server on 5173, y-websocket on 1234)
EXPOSE 5173 1234

# Correct CMD: Run multiple commands using shell form
CMD ["sh", "-c", "npm run dev & npx y-websocket --port 1234"]
