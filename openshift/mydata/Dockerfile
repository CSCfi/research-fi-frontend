# This file is part of the research.fi service
#
# Copyright 2021 Ministry of Education and Culture, Finland
#
# :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
# :license: MIT

# Stage 1: Build Angular application
#FROM docker-registry.default.svc:5000/ts/node:12.12.0-alpine as builder
FROM node:12.12.0-alpine as builder
COPY . /webapp
WORKDIR /webapp
RUN chown -R node:node /webapp
USER node
RUN npm install
RUN npm run build mydata --configuration=production

# Stage 2: Serve Angular application
#FROM docker-registry.default.svc:5000/ts/node:12.12.0-alpine as angular
FROM node:12.12.0-alpine as builder
COPY --from=builder /app/dist/ /dist/
WORKDIR /

RUN chown -R node:node /dist
USER node

EXPOSE 8080
CMD node dist/server.js