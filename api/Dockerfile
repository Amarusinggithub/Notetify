# syntax=docker/dockerfile:1
ARG PHP_VERSION=8.3.11

# Stage 1: Install production dependencies (Composer)

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


# Stage 2: Install development dependencies

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


# Stage 3: Shared PHP Runtime (SWITCHED TO APACHE)

FROM php:${PHP_VERSION}-apache AS base
WORKDIR /var/www/html

# 1. Install System Dependencies & Redis
# We use 'apt-get' here because the Apache image is Debian-based, not Alpine.
RUN apt-get update && apt-get install -y \
    libzip-dev \
    libpng-dev \
    libpq-dev \
    libicu-dev \
    git \
    unzip \
    # Install Redis extension via PECL
    && pecl install redis \
    && docker-php-ext-enable redis \
    # Install standard Laravel extensions
    && docker-php-ext-install -j$(nproc) \
        bcmath \
        intl \
        opcache \
        pcntl \
        pdo_pgsql \
        zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Configure Apache to point to /public (Laravel standard)
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 3. Enable Apache mod_rewrite
RUN a2enmod rewrite

# 4. Copy Entrypoint Scripts
COPY entrypoint.dev.sh entrypoint.prod.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.dev.sh /usr/local/bin/entrypoint.prod.sh

# 5. Create Storage Dirs & Permissions (Apache runs as www-data)
RUN mkdir -p \
        bootstrap/cache \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose HTTP Port 80 (Standard for Apache)
EXPOSE 80


# Stage 4: Development Image

FROM base AS development
ENV APP_ENV=local
ENV APP_DEBUG=true

# Copy all dependencies (including dev tools) from Stage 2
COPY --from=vendor_dev /app/vendor /var/www/html/vendor
COPY . /var/www/html

# Ensure permissions are correct after copy
RUN chown -R www-data:www-data /var/www/html


# Stage 5: Production Image

FROM base AS production
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV PHP_OPCACHE_VALIDATE_TIMESTAMPS=0
ENV PHP_OPCACHE_MAX_ACCELERATED_FILES=20000
ENV PHP_OPCACHE_MEMORY_CONSUMPTION=192

# Copy only production dependencies from Stage 1
COPY --from=vendor /app/vendor /var/www/html/vendor
COPY . /var/www/html

# Final Permission Fix
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
