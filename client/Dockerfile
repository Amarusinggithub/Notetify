# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.17.1

################################################################################
# Base stage - Install dependencies only
################################################################################
FROM node:${NODE_VERSION}-alpine AS base

RUN corepack enable

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

################################################################################
# Build stage - Build the application
################################################################################
FROM base AS build

WORKDIR /usr/src/app

COPY . .

ARG VITE_BASE_URL
ARG VITE_WS_ORIGIN
ARG VITE_APP_NAME
ARG VITE_CLIENT_URL

ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_WS_ORIGIN=${VITE_WS_ORIGIN}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_CLIENT_URL=${VITE_CLIENT_URL}

RUN pnpm build

################################################################################
# Development stage
################################################################################
FROM node:${NODE_VERSION}-alpine AS development

ENV NODE_ENV=development

RUN corepack enable

WORKDIR /usr/src/app

COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/package.json ./package.json

COPY . .

COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["sh", "entrypoint.sh"]

################################################################################
# Production stage
################################################################################
FROM nginx:stable-alpine AS production

ENV NODE_ENV=production

# Install wget for health checks
RUN apk add --no-cache wget

# Remove default nginx configuration
RUN rm -rf /usr/share/nginx/html/* && \
    rm -f /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts from the build stage
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx && \
    chmod -R 755 /usr/share/nginx/html

# Create directory for Let's Encrypt challenges
RUN mkdir -p /usr/share/nginx/html/.well-known/acme-challenge && \
    chown -R nginx:nginx /usr/share/nginx/html/.well-known

USER nginx

EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

ENTRYPOINT ["nginx", "-g", "daemon off;"]


