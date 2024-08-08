import { mergeApplicationConfig, ApplicationConfig, makeStateKey, TransferState, APP_INITIALIZER } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const ENV_KEY = makeStateKey<{
  cmsUrl: string,
  buildInfo: string,
  profileApiUrl: string,
  apiUrl: string,
  matomoSiteId: number
}>('env');

/**
 * Read the required environment variables from process.env
 * and set them in the transfer state using defined above key.
 * This function is executed as an app initializer.
 */
export function transferStateFactory(transferState: TransferState) {
  return () => {
    const envVars = {
      cmsUrl: "https://cms-nginx-devel-researchfi.2.rahtiapp.fi",
      buildInfo: "devel",
      matomoSiteId: 4,
      profileApiUrl: "https://mydata-api-devel.2.rahtiapp.fi/api",
      apiUrl: "https://researchfi-api-devel.2.rahtiapp.fi",

      /*cmsUrl: process.env.SSR_CMS_URL,
      buildInfo: process.env.SSR_API_URL,
      matomoSiteId: process.env.SSR_PROFILE_API_URL,
      profileApiUrl: process.env.SSR_BUILD_INFO,
      apiUrl: process.env.SSR_MATOMO_SITE_ID*/



    };

    transferState.set<{ cmsUrl: string }>(ENV_KEY, envVars);
  };
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    {
      provide: APP_INITIALIZER,
      useFactory: transferStateFactory,
      deps: [TransferState],
      multi: true,
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
