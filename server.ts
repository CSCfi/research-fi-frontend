/**
 * *** NOTE ON IMPORTING FROM ANGULAR AND NGUNIVERSAL IN THIS FILE ***
 *
 * If your application uses third-party dependencies, you'll need to
 * either use Webpack or the Angular CLI's `bundleDependencies` feature
 * in order to adequately package them for use on the server without a
 * node_modules directory.
 *
 * However, due to the nature of the CLI's `bundleDependencies`, importing
 * Angular in this file will create a different instance of Angular than
 * the version in the compiled application code. This leads to unavoidable
 * conflicts. Therefore, please do not explicitly import from @angular or
 * @nguniversal in this file. You can export any needed resources
 * from your application's main.server.ts file, as seen below with the
 * import for `ngExpressEngine`.
 */

import 'zone.js/dist/zone-node';

import { enableProdMode } from '@angular/core';
import express from 'express';
import * as compression from 'compression';
import featurePolicy from 'feature-policy';
import { join } from 'path';
import { EXPRESS_HTTP_PORT } from './src/app/app.global';
import { EmailService } from './src/app/shared/services/email.service';

const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');
const referrerPolicy = require('referrer-policy');

// Add timestamp to logs
require('log-timestamp');
const bodyParser = require('body-parser');

enableProdMode();

// Express server
const app = express();
const DIST_FOLDER = join(process.cwd(), 'dist');

// We have a routes configuration to define where to serve every app with the according language.
const routes = [
  { path: '/en/*', view: 'en/index', bundle: require('./dist/server/en/main') },
  { path: '/sv/*', view: 'sv/index', bundle: require('./dist/server/sv/main') },
  { path: '/*', view: 'fi/index', bundle: require('./dist/server/fi/main') },
];

app.use(bodyParser.json());
app.use(compression());
app.use(referrerPolicy({ policy: 'same-origin' }));

app.use(
  featurePolicy({
    features: {
      fullscreen: ["'self'"],
      payment: ["'none'"],
      syncXhr: ["'none'"],
    },
  })
);

// Set default sources after app config file load. Use dynamic CMS address
const getAppConfig = new Promise((resolve, reject) => {
  const fs = require('fs');
  fs.readFile(
    DIST_FOLDER + '/browser/fi/assets/config/config.json',
    (err, data) => {
      if (err) {
        const errorMsg = 'Error: Could not open config.json';
        console.error(errorMsg);
        reject(errorMsg);
      } else {
        resolve(JSON.parse(data));
      }
    }
  );
});

getAppConfig.then((data: any) => {
  app.use(
    expressCspHeader({
      directives: {
        'default-src': [
          SELF,
          "'self'",
          'ws://localhost:4200',
          'ws://localhost:5003',
          'http://localhost:*',
          'http://*.csc.fi:*',
          'https://*.csc.fi:*',
          'http://*.rahtiapp.fi:*',
          'https://*.rahtiapp.fi:*',
          'http://*.tiedejatutkimus.fi:*',
          'https://*.tiedejatutkimus.fi:*',
          'http://*.forskning.fi:*',
          'https://*.forskning.fi:*',
          'http://*.research.fi:*',
          'https://*.research.fi:*',
          'https://doi.org:*',
          'https://data.crossref.org:*',
          'https://app.powerbi.com:*',
          'https://fonts.googleapis.com:*',
          data.cmsUrl,
        ],
        'script-src': [
          SELF,
          INLINE,
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://*.csc.fi:*',
          'https://*.twitter.com:*',
          'https://cdn.syndication.twimg.com:*',
        ],
        'style-src': [
          SELF,
          'mystyles.net',
          "'self'",
          "'unsafe-inline'",
          'https://*.twitter.com:*',
          'https://fonts.googleapis.com:*',
          'https://*.twimg.com:*',
        ],
        'img-src': [
          'data:',
          "'self'",
          'ws://localhost:4200',
          'ws://localhost:5003',
          'http://localhost:*',
          'https://apps.utu.fi:*',
          'https://tt.eduuni.fi:*',
          'https://www.maanmittauslaitos.fi:*',
          'https://rihmatomo-analytics.csc.fi:*',
          'https://wiki.eduuni.fi:*',
          'https://www.hamk.fi:*',
          'https://mediapankki.tuni.fi:*',
          'https://www.turkuamk.fi:*',
          'https://*.twitter.com:*',
          'https://*.twimg.com:*',
          'https://*.w3.org:*',
          'data:',
          data.cmsUrl,
        ],
        'worker-src': [NONE],
        'frame-src': [
          'https://app.powerbi.com:*',
          'https://rihmatomo-analytics.csc.fi:*',
          'https://*.twitter.com:*',
        ],
        'font-src': [
          SELF,
          "'self'",
          'fonts.googleapis.com:*',
          'fonts.gstatic.com:*',
        ],
        'block-all-mixed-content': true,
      },
    })
  );
});

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
// We have one configuration per locale and use designated server file for matching route.
const {
  AppServerModule: AppServerModuleFi,
  ngExpressEngine: ngExpressEngineFi,
} = require('./dist/server/fi/main');
const {
  AppServerModule: AppServerModuleEn,
  ngExpressEngine: ngExpressEngineEn,
} = require('./dist/server/en/main');
const {
  AppServerModule: AppServerModuleSv,
  ngExpressEngine: ngExpressEngineSv,
} = require('./dist/server/sv/main');

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)

// Example Express Rest API endpoints
// app.get('/api/**', (req, res) => { });
// Serve static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

routes.forEach((route) => {
  if (route.path.startsWith('/en')) {
    // EN routes
    app.get(route.path, (req, res) => {
      app.engine(
        'html',
        ngExpressEngineEn({
          bootstrap: AppServerModuleEn,
        })
      );
      app.set('view engine', 'html');
      app.set('views', join(DIST_FOLDER, 'browser'));

      res.render(route.view, {
        req,
        res,
        engine: ngExpressEngineEn({
          bootstrap: AppServerModuleEn,
        }),
      });
    });
  } else if (route.path.startsWith('/sv')) {
    // SV routes
    app.get(route.path, (req, res) => {
      app.engine(
        'html',
        ngExpressEngineSv({
          bootstrap: AppServerModuleSv,
        })
      );
      app.set('view engine', 'html');
      app.set('views', join(DIST_FOLDER, 'browser'));

      res.render(route.view, {
        req,
        res,
        engine: ngExpressEngineSv({}),
      });
    });
  } else {
    // FI routes
    app.get(route.path, (req, res) => {
      app.engine(
        'html',
        ngExpressEngineFi({
          bootstrap: AppServerModuleFi,
        })
      );
      app.set('view engine', 'html');
      app.set('views', join(DIST_FOLDER, 'browser'));

      res.render(route.view, {
        req,
        res,
        engine: ngExpressEngineFi({
          bootstrap: AppServerModuleFi,
        }),
      });
    });
  }
});

// Send email.
// Email server configuration is read from file config.json.
// Email is sent using nodemailer.
const emailService = new EmailService();
app.post('/feedback', (req, res) => {
  const fs = require('fs');
  fs.readFile(
    DIST_FOLDER + '/browser/fi/assets/config/config.json',
    (err, data) => {
      if (err) {
        const errorMsg = 'Email: Error: Could not open config.json';
        console.error(errorMsg);
        res.status(500).send({ error: errorMsg });
      } else {
        const appConfig = JSON.parse(data);

        if (!appConfig.email) {
          const errorMsg =
            'Email: Error: Could not find configuration in config.json';
          console.error(errorMsg);
          res.status(500).send({ error: errorMsg });
        } else if (!appConfig.email.enabled) {
          const errorMsg = 'Email: Error: Sending is disabled';
          console.error(errorMsg);
          res.status(500).send({ error: errorMsg });
        } else {
          const host = appConfig.email.host;
          const port = appConfig.email.port;
          const username = appConfig.email.username;
          const password = appConfig.email.password;
          const receiver = appConfig.email.receiver;

          emailService.sendMail(
            host,
            port,
            username,
            password,
            receiver,
            req.body,
            (info) => {
              console.log(
                'Email: Success: Sent message to ' +
                  receiver +
                  ' via ' +
                  host +
                  ':' +
                  port
              );
              res.send(info);
            }
          );
        }
      }
    }
  );
});

// Start up the Node server
app.listen(EXPRESS_HTTP_PORT, () => {
  console.log(
    `Node Express server listening on http://localhost:${EXPRESS_HTTP_PORT}`
  );
  console.log('DIST_FOLDER ' + DIST_FOLDER);
});
