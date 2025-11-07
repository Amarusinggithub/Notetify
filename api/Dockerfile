# syntax=docker/dockerfile:1

ARG PHP_VERSION=8.2

# Stage 1: install production dependencies with Composer
FROM composer:lts AS vendor
WORKDIR /app
ENV COMPOSER_ALLOW_SUPERUSER=1

COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/tmp/cache \
    composer install \
        --no-dev \
        --no-interaction \
        --prefer-dist \
        --no-progress \
        --optimize-autoloader \
        --no-scripts

COPY . .
RUN composer dump-autoload \
        --no-dev \
        --optimize \
        --no-interaction \
        --no-scripts

# Stage 2: install development dependencies (includes dev tools)
ARG PHP_VERSION
FROM composer:lts AS vendor_dev
WORKDIR /app
ENV COMPOSER_ALLOW_SUPERUSER=1

COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/tmp/cache \
    composer install \
        --no-interaction \
        --prefer-dist \
        --no-progress \
        --no-scripts

COPY . .
RUN composer dump-autoload \
        --no-interaction \
        --no-scripts

# Stage 3: shared PHP runtime
FROM php:${PHP_VERSION}-fpm-alpine AS base
WORKDIR /app
ENV PATH="/app/vendor/bin:${PATH}"

# Install required system packages and PHP extensions for Laravel
RUN set -eux; \
    apk add --no-cache \
        bash \
        busybox-extras \
        curl \
        git \
        icu-libs \
        libpq \
        libzip \
        shadow \
        tzdata; \
    apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        icu-dev \
        libzip-dev \
        postgresql-dev; \
    docker-php-ext-configure intl; \
    docker-php-ext-install -j"$(nproc)" \
        bcmath \
        intl \
        opcache \
        pcntl \
        pdo_pgsql \
        zip; \
    apk del .build-deps; \
    rm -rf /tmp/* /var/cache/apk/*

COPY entrypoint.dev.sh entrypoint.prod.sh ./
RUN mkdir -p \
        bootstrap/cache \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
    && chmod +x entrypoint.dev.sh entrypoint.prod.sh \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000

# Stage 4: development image
FROM base AS development
ENV APP_ENV=local \
    APP_DEBUG=true \
    COMPOSER_ALLOW_SUPERUSER=1

COPY --from=vendor_dev /app/vendor ./vendor
COPY . .

# Stage 5: production image
FROM base AS production
ENV APP_ENV=production \
    APP_DEBUG=false \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0 \
    PHP_OPCACHE_MAX_ACCELERATED_FILES=20000 \
    PHP_OPCACHE_MEMORY_CONSUMPTION=192

COPY --from=vendor /app/vendor ./vendor
COPY . .
RUN chown -R www-data:www-data storage bootstrap/cache
