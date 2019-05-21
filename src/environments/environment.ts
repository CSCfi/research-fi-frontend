/*
This file is part of the research.fi API service

Copyright 2019 Ministry of Education and Culture, Finland

:author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
:license: MIT
*/

/*
For development:
- Copy this file as 'environment.researchfi.ts'.
- Replace string '<API_HOST>' with the correct API server address.
*/

export const environment = {
  production: false,
  apiUrl: 'http://<API_HOST>/portalapi/',
  buildInfo: '<BUILD_INFO>'
};