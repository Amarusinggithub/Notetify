# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.17.1

################################################################################
# Base stage - Install dependencies only
################################################################################
FROM node:${NODE_VERSION}-alpine AS base

RUN corepack enable && corepack prepare pnpm@11.0.8 --activate

WORKDIR /usr/src/app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

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

RUN \
    if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

################################################################################
# Development stage
################################################################################
FROM node:${NODE_VERSION}-alpine AS development

ENV NODE_ENV=development

RUN corepack enable && corepack prepare pnpm@11.0.8 --activate

WORKDIR /usr/src/app

COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/package.json ./package.json

COPY . .

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "/usr/local/bin/entrypoint.sh"]

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


