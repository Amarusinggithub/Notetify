# syntax=docker/dockerfile:1

ARG PHP_VERSION=8.2

################################################################################
# Composer dependencies stage - Production
################################################################################
FROM composer:lts AS vendor

WORKDIR /app

ENV COMPOSER_ALLOW_SUPERUSER=1

COPY composer.json composer.lock ./

RUN --mount=type=cache,target=/tmp/cache \
    composer install \
        --no-dev \
        --no-interaction \
        --no-scripts \
        --no-autoloader \
        --prefer-dist

COPY . .

RUN composer dump-autoload \
        --optimize \
        --classmap-authoritative \
        --no-dev

################################################################################
# Composer dependencies stage - Development
################################################################################
FROM composer:lts AS vendor_dev

WORKDIR /app

ENV COMPOSER_ALLOW_SUPERUSER=1

COPY composer.json composer.lock ./

RUN --mount=type=cache,target=/tmp/cache \
    composer install \
        --no-interaction \
        --no-scripts \
        --no-autoloader \
        --prefer-dist

COPY . .

RUN composer dump-autoload \
        --no-interaction \
        --no-scripts

################################################################################
# Base PHP runtime stage
################################################################################
FROM php:${PHP_VERSION}-fpm-alpine AS base

WORKDIR /app

ENV PATH="/app/vendor/bin:${PATH}"

# Install required system packages and PHP extensions
RUN set -eux; \
    apk add --no-cache \
        bash \
        busybox-extras \
        curl \
        git \
        icu-libs \
        libpq \
        libzip \
        nginx \
        shadow \
        supervisor \
        tzdata \
        unzip; \
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
    pecl install redis; \
    docker-php-ext-enable redis; \
    apk del .build-deps; \
    rm -rf /tmp/* /var/cache/apk/*

# Copy PHP configuration
COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini

# Copy Nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# Copy Supervisor configuration
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create Laravel directories
RUN mkdir -p \
        bootstrap/cache \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
    && chown -R www-data:www-data \
        bootstrap/cache \
        storage

EXPOSE 80

################################################################################
# Development stage
################################################################################
FROM base AS development

ENV APP_ENV=local \
    APP_DEBUG=true \
    COMPOSER_ALLOW_SUPERUSER=1

# Copy entrypoint script
COPY docker/entrypoint.dev.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy vendor from dev stage
COPY --from=vendor_dev --chown=www-data:www-data /app/vendor ./vendor

# Copy application code
COPY --chown=www-data:www-data . .

# Ensure proper permissions
RUN chown -R www-data:www-data \
        bootstrap/cache \
        storage

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

################################################################################
# Production build stage
################################################################################
FROM base AS production_build

WORKDIR /app

COPY --from=vendor --chown=www-data:www-data /app/vendor ./vendor

COPY --chown=www-data:www-data . .

RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan event:cache

################################################################################
# Production stage
################################################################################
FROM base AS production

ENV APP_ENV=production \
    APP_DEBUG=false \
    PHP_OPCACHE_ENABLE=1 \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0 \
    PHP_OPCACHE_MAX_ACCELERATED_FILES=20000 \
    PHP_OPCACHE_MEMORY_CONSUMPTION=192 \
    PHP_OPCACHE_INTERNED_STRINGS_BUFFER=16

# Copy PHP production configuration
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Copy entrypoint script
COPY docker/entrypoint.prod.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy optimized application from build stage
COPY --from=production_build --chown=www-data:www-data /app ./

# Remove unnecessary files
RUN rm -rf \
        tests \
        .git \
        .github \
        .env.example \
        phpunit.xml \
        README.md

# Ensure proper permissions
RUN chown -R www-data:www-data \
        bootstrap/cache \
        storage

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD php artisan health:check || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
