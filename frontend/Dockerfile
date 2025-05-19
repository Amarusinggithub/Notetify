# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.0
FROM node:${NODE_VERSION}-alpine AS build

# Working directory for your app
WORKDIR /usr/src/app

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Install dependencies separately to leverage caching
COPY package.json package-lock.json ./


RUN --mount=type=cache,target=/root/.npm \
    npm ci


# Copy your app's source code into the container
COPY . .

#RUN useradd -m -r node

# Ensure the non-root user owns the files
#RUN chown -R node:node /usr/src/app

# Switch to non-root user for security
#USER node

RUN npm run build



# Stage 2: Development environment
FROM node:${NODE_VERSION}-alpine  AS development
ENV NODE_ENV=development

WORKDIR /usr/src/app

# Install dependencies separately to leverage caching
COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
   npm ci

# grab node_modules + package files from the “build” stage
#COPY --from=build --chown=node:node /usr/src/app/node_modules ./node_modules
#COPY --from=build --chown=node:node /usr/src/app/package*.json ./

# now overlay your source (also owned by node)
COPY --from=build /usr/src/app/dist ./dist

COPY entrypoint.sh .

RUN chmod +x ./entrypoint.sh

#RUN chown -R node:node /usr/src/app

# Switch to non-root user for security
#USER node

EXPOSE 3000

ENTRYPOINT ["sh", "entrypoint.sh"]



# Production Stage
FROM nginx:stable-alpine AS production
ENV NODE_ENV=production
COPY --from=build /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html
USER nginx
EXPOSE 80
ENTRYPOINT  ["nginx", "-g", "daemon off;"]


