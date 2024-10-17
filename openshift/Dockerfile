# This file is part of the research.fi service
#
# Copyright 2019 Ministry of Education and Culture, Finland
#
# :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
# :license: MIT

# Stage 1: Build Angular application
FROM docker-registry.default.svc:5000/researchfi/node:14.15.0-alpine as builder
COPY . /app
WORKDIR /app
RUN chown -R node:node /app
USER node
RUN npm install
RUN npm run build:ssr

# Stage 2: Serve Angular application
FROM docker-registry.default.svc:5000/researchfi/node:14.15.0-alpine as angular
COPY --from=builder /app/dist/ /dist/
### NOTE: Copying of style file leads into increased TTFB value and therefore poor performance
### Do not use this file copy method.
## SSR build warns from non existent stylesheet in 'browser/'
# ## Manually copy this file from localized build to suppress this warning
# COPY --from=builder /app/dist/browser/fi/*.css /dist/browser/
WORKDIR /

RUN chown -R node:node /dist
USER node

EXPOSE 8080
CMD node dist/server.js
