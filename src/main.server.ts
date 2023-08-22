/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';
import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';

export { AppServerModule } from './app/app.server.module';
export { ngExpressEngine } from '@nguniversal/express-engine';

export { renderModuleFactory } from '@angular/platform-server';

if (environment.production) {
  enableProdMode();
}
