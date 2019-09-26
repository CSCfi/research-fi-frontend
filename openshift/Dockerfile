# This file is part of the research.fi service
#
# Copyright 2019 Ministry of Education and Culture, Finland
#
# :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
# :license: MIT

# Stage 1: Build Angular application
FROM node:10.15.3-alpine as builder
COPY . /app
WORKDIR /app

RUN npm install
# Build Finnish language version
RUN $(npm bin)/ng build --prod --configuration=fi
# Build Swedish language version
RUN $(npm bin)/ng build --prod --configuration=sv --i18n-file src/i18n/messages.sv.xlf --i18n-format xlf --i18n-locale sv --baseHref /sv/
# Build English language version
RUN $(npm bin)/ng build --prod --configuration=en --i18n-file src/i18n/messages.en.xlf --i18n-format xlf --i18n-locale en --baseHref /en/

# Stage 2: Serve application using Nginx (non-root version)
FROM nginxinc/nginx-unprivileged as nginx
COPY --from=builder /app/dist/research-fi/ /usr/share/nginx/html/
COPY --from=builder /app/dist/research-fi-sv/ /usr/share/nginx/html/sv/
COPY --from=builder /app/dist/research-fi-en/ /usr/share/nginx/html/en/
COPY nginx/default.conf /etc/nginx/conf.d/
EXPOSE 8080