
import { app as serverFi } from './server/fi/server.mjs';
import { app as serverEn } from './server/en/server.mjs';
import { app as serverSv } from './server/sv/server.mjs';

const express = require('express');

function run() {
  const port = process.env.PORT || 8080;
  const server = express();

  server.use('/fi', serverFi());
  server.use('/sv', serverSv());
  server.use('/en', serverEn());
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
