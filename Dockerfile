FROM php:8.1-apache
ARG PAT
ARG DATE
ARG VERSION
ARG REVISION

# APACHE + PHP
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli
RUN docker-php-ext-install exif && docker-php-ext-enable exif
RUN docker-php-ext-install intl && docker-php-ext-enable intl
RUN apt-get update && apt-get upgrade -y && apt-get install -y libpng-dev libfreetype6-dev libjpeg62-turbo-dev libgd-dev libpng-dev libwebp-dev libzip-dev zip git
RUN a2enmod rewrite
RUN docker-php-ext-configure gd --with-webp \
--with-freetype=/usr/include/ \
--with-jpeg=/usr/include/
RUN docker-php-ext-install gd
RUN docker-php-ext-install zip

# COPY APP FILES
COPY ./application /var/www/html/application
COPY ./application_config /var/www/html/application_config
# RUN rm -rf  /var/www/html/application_config/.env
COPY ./public /var/www/html/public
COPY ./serdelia_config /var/www/html/serdelia_config
# RUN rm -rf /var/www/html/serdelia_config/.env
COPY ./.htaccess /var/www/html/.htaccess
COPY ./.htpasswd /var/www/html/.htpasswd
COPY ./index.php /var/www/html/index.php
COPY ./serdelia_config.php /var/www/html/serdelia_config.php
COPY ./version.txt /var/www/html/version.txt
COPY ./.htaccess_serdelia /var/www/html/.htaccess_serdelia
COPY ./robots.txt /var/www/html/robots.txt

# UHO8 FRAMEWORK
RUN rm -rf ./application/_uho
RUN git clone https://git:$PAT@github.com/huncwotdigital/uho8 --branch=master ./application/_uho
RUN mkdir /var/www/html/reports; exit 0
RUN mkdir /var/www/html/cache; exit 0
RUN chown www-data /var/www/html/reports
RUN chown www-data /var/www/html/cache

# SERDELIA8 CMS
RUN rm -rf ./serdelia
RUN git clone https://git:$PAT@github.com/huncwotdigital/serdelia8 --branch=master ./serdelia
RUN mkdir /var/www/html/serdelia/reports; exit 0
RUN chown www-data /var/www/html/serdelia/reports
RUN ln -s ../../application/_uho ./serdelia/application/_uho
RUN mv ./serdelia/temp_to_rename ./serdelia/temp
RUN chown -R www-data ./serdelia/temp

RUN rm ./serdelia/.htaccess
RUN mv ./.htaccess_serdelia /var/www/html/serdelia/.htaccess

LABEL org.opencontainers.image.created=$DATE
LABEL org.opencontainers.image.url="https://github.com/huncwotdigital/uhomvc8"
LABEL org.opencontainers.image.source="https://github.com/huncwotdigital/uhomvc8"
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.revision=$REVISION
LABEL org.opencontainers.image.vendor="Huncwot"
LABEL org.opencontainers.image.title="UHOMVC8 framework boilerplate"
LABEL org.opencontainers.image.authors="huncwotdigital"

# Setup PHP INI vars
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
RUN sed -i 's/post_max_size = 8M/post_max_size = 4096M/g' "$PHP_INI_DIR/php.ini"
RUN sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 4096M/g' "$PHP_INI_DIR/php.ini"
RUN sed -i 's/max_execution_time = 8M/max_execution_time = 600/g' "$PHP_INI_DIR/php.ini"

EXPOSE 80
CMD ["apache2-foreground"]
