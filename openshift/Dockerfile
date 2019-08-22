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

# Create Angular production environment file
ARG API_HOST
RUN sed "s|<API_HOST>|$API_HOST|g" /app/src/environments/environment.prod.ts > /app/src/environments/environment.researchfi.prod.ts

RUN npm install
RUN $(npm bin)/ng build --prod

# Stage 2: Serve application using Nginx (non-root version)
FROM nginxinc/nginx-unprivileged as nginx
COPY --from=builder /app/dist/research-fi/* /usr/share/nginx/html/
COPY nginx/default.conf /etc/nginx/conf.d/
EXPOSE 8080