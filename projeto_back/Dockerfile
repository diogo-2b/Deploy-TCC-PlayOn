FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libpq-dev \
    zlib1g-dev \
    $PHPIZE_DEPS \
    && if [ -f "/usr/include/$(dpkg-architecture -qDEB_HOST_MULTIARCH)/zconf.h" ] && [ ! -f /usr/include/zconf.h ]; then \
        ln -s "/usr/include/$(dpkg-architecture -qDEB_HOST_MULTIARCH)/zconf.h" /usr/include/zconf.h; \
    fi \
    && pecl install grpc \
    && docker-php-ext-enable grpc \
    && docker-php-ext-install pdo pdo_pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

ENV LOG_CHANNEL=stderr

RUN php -m | grep -i '^grpc$'
RUN composer install --no-dev --optimize-autoloader

RUN php artisan about

RUN php artisan config:clear
RUN php artisan storage:link || true

EXPOSE 10000

CMD php artisan serve --host=0.0.0.0 --port=$PORT
