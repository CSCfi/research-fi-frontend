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
import * as express from 'express';
import * as compression from 'compression';
import * as helmet from 'helmet';
import {join} from 'path';
import { EXPRESS_HTTP_PORT } from './src/app/app.global';

enableProdMode();

// Express server
const app = express();
const DIST_FOLDER = join(process.cwd(), 'dist');

const routes = [
  {path: '/en/*', view: 'en/index', bundle: require('./dist/server/main')},
  //{path: '/sv/*', view: 'sv/index', bundle: require('./dist/server/sv/main')},
  {path: '/*', view: 'fi/index', bundle: require('./dist/server/main')}
];

app.use(compression());
app.use(helmet());
app.use(helmet.referrerPolicy({policy: 'same-origin'}));
app.use(helmet.noCache());
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
      'https://doi.org:*',
      'https://data.crossref.org:*',
      'https://app.powerbi.com:*'
    ],
    styleSrc: [
      '\'self\'',
      '\'unsafe-inline\''
    ],
    scriptSrc: [
      '\'self\'',
      '\'unsafe-inline\'',
      'https://*.csc.fi:*'
    ],
    frameSrc: [
      'https://app.powerbi.com:*'
    ]
  }
}));

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {AppServerModule, LAZY_MODULE_MAP, ngExpressEngine, provideModuleMap} = require('./dist/server/main');

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModule,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');3
app.set('views', join(DIST_FOLDER, 'browser'));

// Example Express Rest API endpoints
// app.get('/api/**', (req, res) => { });
// Serve static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

routes.forEach((route) => {
  app.get(route.path, (req, res) => {
    res.render(route.view, {
      req, res, engine: ngExpressEngine({
        bootstrap: route.bundle.AppServerModule,
        providers: [provideModuleMap(route.bundle.LAZY_MODULE_MAP),
        { req, res }]
      })
    });
  });
});

// Start up the Node server
app.listen(EXPRESS_HTTP_PORT, () => {
  console.log(`Node Express server listening on http://localhost:${EXPRESS_HTTP_PORT}`);
  console.log("DIST_FOLDER " + DIST_FOLDER);
});