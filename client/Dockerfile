# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.17.1


# Stage 1: Base (Builder)

FROM node:${NODE_VERSION}-alpine AS base

# 1. Enable pnpm
RUN corepack enable

WORKDIR /usr/src/app

# 2. Copy only package files first for better caching
COPY package.json package-lock.json pnpm-lock.yaml ./

# 3. Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 4. Copy the rest of the source code
COPY . .

# 5. Define Build Arguments
ARG VITE_BASE_URL
ARG VITE_WS_ORIGIN
ARG VITE_APP_NAME
ARG VITE_FRONTEND_URL

# 6. Map ARGs to ENVs so Vite can see them during build
ENV VITE_FRONTEND_URL=${VITE_FRONTEND_URL}
ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_WS_ORIGIN=${VITE_WS_ORIGIN}
ENV VITE_APP_NAME=${VITE_APP_NAME}

# Build the application (Creates /usr/src/app/dist)
RUN pnpm build


# Stage 2: Development environment

FROM node:${NODE_VERSION}-alpine AS development
ENV NODE_ENV=development

RUN corepack enable
WORKDIR /usr/src/app

# Copy dependencies and source from base
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app .

COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

# Use array syntax for better signal handling
ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]



# Stage 3: Production environment (Nginx)

FROM nginx:stable-alpine AS production
ENV NODE_ENV=production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx config
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts from the 'base' stage
COPY --from=base /usr/src/app/dist /usr/share/nginx/html



EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
