# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.0
FROM node:${NODE_VERSION}-alpine AS build

# Working directory for your app
WORKDIR /usr/src/app

COPY ../nginx/nginx.conf /etc/nginx/conf.d/default.conf

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

RUN npm run build



# Stage 2: Development environment
FROM node:${NODE_VERSION}-alpine  AS development
ENV NODE_ENV=development

WORKDIR /usr/src/app

# Install dependencies separately to leverage caching
COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY entrypoint.sh .

RUN chmod +x ./entrypoint.sh

# Copy the full source code
COPY . .


# Ensure the non-root user owns the files
RUN chown -R node:node /usr/src/app

# Switch to non-root user for security
USER node

# Expose port for the development server
EXPOSE 3000 1234

CMD ["sh", "entrypoint.sh"]



# Production Stage
FROM nginx:stable-alpine AS production
ENV NODE_ENV=production
COPY --from=build /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html
USER nginx
EXPOSE 80
ENTRYPOINT  ["nginx", "-g", "daemon off;"]


