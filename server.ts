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

import {enableProdMode} from '@angular/core';
import express from 'express';
import * as compression from 'compression';
import * as helmet from 'helmet';
import {join} from 'path';
import { EXPRESS_HTTP_PORT } from './src/app/app.global';
import { EmailService } from './src/app/services/email.service';

// Add timestamp to logs
require('log-timestamp');
var bodyParser = require('body-parser')

enableProdMode();

// Express server
const app = express();
const DIST_FOLDER = join(process.cwd(), 'dist');

// We have a routes configuration to define where to serve every app with the according language.
const routes = [
  {path: '/en/*', view: 'en/index', bundle: require('./dist/server/en/main')},
  {path: '/sv/*', view: 'sv/index', bundle: require('./dist/server/sv/main')},
  {path: '/*', view: 'fi/index', bundle: require('./dist/server/fi/main')}
];

app.use(bodyParser.json());
app.use(compression());
app.use(helmet());
app.use(helmet.referrerPolicy({policy: 'same-origin'}));
app.use(helmet.featurePolicy({
  features: {
    fullscreen: ['\'self\''],
    payment: ['\'none\''],
    syncXhr: ['\'none\'']
  }
}));

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: [
      '\'self\'',
      'ws://localhost:4200',
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
    ],
    styleSrc: [
      '\'self\'',
      '\'unsafe-inline\'',
      'https://*.twitter.com:*',
      'https://fonts.googleapis.com:*'
    ],
    scriptSrc: [
      '\'self\'',
      '\'unsafe-inline\'',
      '\'unsafe-eval\'',
      'https://*.csc.fi:*',
      'https://*.twitter.com:*',
      'https://cdn.syndication.twimg.com:*',
    ],
    frameSrc: [
      'https://app.powerbi.com:*',
      'https://rihmatomo-analytics.csc.fi:*',
      'https://*.twitter.com:*'
    ],
    fontSrc: [
      '\'self\'',
      'fonts.googleapis.com:*',
      'fonts.gstatic.com:*'
    ],
    imgSrc: [
      '\'self\'',
      'ws://localhost:4200',
      'http://localhost:*',
      'https://apps.utu.fi:*',
      'https://tt.eduuni.fi:*',
      'https://www.maanmittauslaitos.fi:*',
      'https://rihmatomo-analytics.csc.fi:*',
      'https://wiki.eduuni.fi:*',
      'https://www.hamk.fi',
      'https://mediapankki.tuni.fi:*',
      'https://www.turkuamk.fi:*',
      'https://*.twitter.com:*',
      'https://*.twimg.com:*'
    ]
  }
}));

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
// We have one configuration per locale and use designated server file for matching route.
const {AppServerModule: AppServerModuleFi, LAZY_MODULE_MAP: LAZY_MODULE_MAP_FI, ngExpressEngine: ngExpressEngineFi,
  provideModuleMap: provideModuleMapFi} = require('./dist/server/fi/main');
const {AppServerModule: AppServerModuleEn, LAZY_MODULE_MAP: LAZY_MODULE_MAP_EN, ngExpressEngine: ngExpressEngineEn,
  provideModuleMap: provideModuleMapEn} = require('./dist/server/en/main');
const {AppServerModule: AppServerModuleSv, LAZY_MODULE_MAP: LAZY_MODULE_MAP_SV, ngExpressEngine: ngExpressEngineSv,
    provideModuleMap: provideModuleMapSv} = require('./dist/server/sv/main');

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)

// Example Express Rest API endpoints
// app.get('/api/**', (req, res) => { });
// Serve static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

routes.forEach((route) => {
  if (route.path.startsWith('/en')) {
    // EN routes
    app.get(route.path, (req, res) => {

      app.engine('html', ngExpressEngineEn({
        bootstrap: AppServerModuleEn,
        providers: [
          provideModuleMapEn(LAZY_MODULE_MAP_EN)
        ]
      }));
      app.set('view engine', 'html');
      app.set('views', join(DIST_FOLDER, 'browser'));

      res.render(route.view, {
        req,
        res,
        engine: ngExpressEngineEn({
          bootstrap: AppServerModuleEn,
          providers: [provideModuleMapEn(LAZY_MODULE_MAP_EN),
          { req, res }]
        })
      });
    });
  } else if (route.path.startsWith('/sv')) {
    // SV routes
    app.get(route.path, (req, res) => {

      app.engine('html', ngExpressEngineSv({
        bootstrap: AppServerModuleSv,
        providers: [
          provideModuleMapSv(LAZY_MODULE_MAP_SV)
        ]
      }));
      app.set('view engine', 'html');
      app.set('views', join(DIST_FOLDER, 'browser'));

      res.render(route.view, {
        req,
        res,
        engine: ngExpressEngineSv({
          bootstrap: AppServerModuleSv,
          providers: [provideModuleMapSv(LAZY_MODULE_MAP_SV),
          { req, res }]
        })
      });
    });
  } else {
    // FI routes
    app.get(route.path, (req, res) => {

      app.engine('html', ngExpressEngineFi({
        bootstrap: AppServerModuleFi,
        providers: [
          provideModuleMapFi(LAZY_MODULE_MAP_FI)
        ]
      }));
      app.set('view engine', 'html');
      app.set('views', join(DIST_FOLDER, 'browser'));

      res.render(route.view, {
        req, res, engine: ngExpressEngineFi({
          bootstrap: AppServerModuleFi,
          providers: [provideModuleMapFi(LAZY_MODULE_MAP_FI),
          { req, res }]
        })
      });
    });
  }
});

// Send email.
// Email server configuration is read from file config.json.
// Email is sent using nodemailer.
const emailService = new EmailService();
app.post("/feedback", (req, res) => {
  const fs = require('fs');
  fs.readFile(DIST_FOLDER + '/browser/fi/assets/config/config.json', (err, data) => {
    if (err) {
      let errorMsg = 'Email: Error: Could not open config.json';
      console.error(errorMsg);
      res.status(500).send({ error: errorMsg });
    } else { 
      let appConfig = JSON.parse(data);

      if (!appConfig['email']) {
        let errorMsg = 'Email: Error: Could not find configuration in config.json';
        console.error(errorMsg);
        res.status(500).send({ error: errorMsg });
      }
      else if (!appConfig['email']['enabled']) {
        let errorMsg = 'Email: Error: Sending is disabled';
        console.error(errorMsg);
        res.status(500).send({ error: errorMsg });
      }
      else {
        let host = appConfig['email']['host'];
        let port = appConfig['email']['port'];
        let username = appConfig['email']['username'];
        let password = appConfig['email']['password'];
        let receiver = appConfig['email']['receiver'];
        
        emailService.sendMail(host, port, username, password, receiver, req.body, info => {
          console.log('Email: Success: Sent message to ' + receiver + ' via ' + host + ':' + port);
          res.send(info);
        })
      }
    }
  });
});

// Start up the Node server
app.listen(EXPRESS_HTTP_PORT, () => {
  console.log(`Node Express server listening on http://localhost:${EXPRESS_HTTP_PORT}`);
  console.log('DIST_FOLDER ' + DIST_FOLDER);
});
