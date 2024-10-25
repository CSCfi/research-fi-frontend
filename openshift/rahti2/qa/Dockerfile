# This file is part of the research.fi service
#
# Copyright 2024 Ministry of Education and Culture, Finland
#
# :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
# :license: MIT

# Stage 1: Build Angular application
FROM image-registry.openshift-image-registry.svc:5000/researchfi-qa/node:18.20.3-alpine as builder
COPY . /app
WORKDIR /app
RUN chown -R node:node /app
USER node
RUN npm ci
RUN npm run build:ssr

# Stage 2: Serve Angular application
FROM image-registry.openshift-image-registry.svc:5000/researchfi-qa/node:18.20.3-alpine as angular
COPY --from=builder /app/dist/ /dist/
### NOTE: Copying of style file leads into increased TTFB value and therefore poor performance
### Do not use this file copy method.
## SSR build warns from non existent stylesheet in 'browser/'
# ## Manually copy this file from localized build to suppress this warning
COPY --from=builder /app/dist/browser/fi/*.css /dist/browser/

# Copy dependencies
COPY --from=builder /app/node_modules/ /node_modules/

WORKDIR /

RUN chown -R node:node /dist
USER node

EXPOSE 8080
CMD node dist/research-fi/proxy-server.mjs
