# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.17.1
FROM node:${NODE_VERSION}-alpine AS base

# 1. Enable pnpm (Corepack is included in Node 16+)
RUN corepack enable

WORKDIR /usr/src/app

# 2. Copy only package files first for better caching
COPY package.json package-lock.json pnpm-lock.yam[l] ./

# 3. Install dependencies
# Using --frozen-lockfile ensures reproducible builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 4. Copy the rest of the source code
COPY . .

# 5. Define Build Arguments (These are required for the Build Step)
ARG VITE_BASE_URL
ARG VITE_WS_ORIGIN
ARG VITE_APP_NAME
ARG VITE_FRONTEND_URL

# 6. Map ARGs to ENVs so Vite can see them during build
ENV VITE_FRONTEND_URL=${VITE_FRONTEND_URL}
ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_WS_ORIGIN=${VITE_WS_ORIGIN}
ENV VITE_APP_NAME=${VITE_APP_NAME}

# Build the application
RUN pnpm build


# Stage 2: Development environment

FROM node:${NODE_VERSION}-alpine AS development
ENV NODE_ENV=development

# Enable pnpm in dev stage too
RUN corepack enable

WORKDIR /usr/src/app

# Copy dependencies and source from base
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app .

COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh

# Switch to non-root user
USER node

EXPOSE 3000

# Use array syntax for better signal handling
ENTRYPOINT ["sh", "entrypoint.sh"]



# Production Stage

FROM nginx:stable-alpine AS production
ENV NODE_ENV=production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx config
# (Optimized: Copied directly from source, not passed through 'base')
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts from the 'base' stage
COPY --from=base /usr/src/app/dist /usr/share/nginx/html


RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

USER nginx

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
