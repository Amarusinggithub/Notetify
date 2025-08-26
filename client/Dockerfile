# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.17.1
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app

COPY ./nginx/nginx.conf /usr/src/app/nginx.conf
COPY package.json package-lock.json ./

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci  --legacy-peer-deps

COPY . .

ARG VITE_BASE_URL
ARG VITE_WS_ORIGIN
ARG VITE_APP_NAME
ARG VITE_FRONTEND_URL


ENV VITE_FRONTEND_URL=${VITE_BASE_URL}
ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_WS_ORIGIN=${VITE_WS_ORIGIN}
ENV VITE_APP_NAME=${VITE_APP_NAME}

USER node

RUN npm run build



# Stage 2: Development environment
FROM node:${NODE_VERSION}-alpine  AS development
ENV NODE_ENV=development

WORKDIR /usr/src/app



COPY --from=base  /usr/src/app/node_modules ./node_modules
COPY --from=base  /usr/src/app/package*.json ./
COPY --from=base /usr/src/app/dist ./dist

COPY entrypoint.sh .

RUN chmod +x ./entrypoint.sh


# Switch to non-root user for security
USER node

EXPOSE 3000

ENTRYPOINT ["sh", "entrypoint.sh"]



# Production Stage
FROM nginx:stable-alpine AS production
ENV NODE_ENV=production
COPY --from=base /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=base /usr/src/app/dist /etc/nginx/html
USER node
EXPOSE 80
ENTRYPOINT  ["nginx", "-g", "daemon off;"]


