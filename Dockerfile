# This file is part of the research.fi service
#
# Copyright 2019 Ministry of Education and Culture, Finland
#
# :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
# :license: MIT

FROM node:12.12.0-alpine as anguladev
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json /usr/src/app/package.json
RUN npm install
RUN npm install -g @angular/cli@7.3.8
COPY . /usr/src/app
CMD ng run serve --configuration=fi --host 0.0.0.0 --port 4200