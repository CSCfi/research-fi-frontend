import { mergeApplicationConfig, ApplicationConfig, makeStateKey, TransferState, inject, provideAppInitializer } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const ENV_KEY = makeStateKey<{
  cmsUrl: string,
  buildInfo: string,
  profileApiUrl: string,
  apiUrl: string,
  matomoSiteId: string
}>('env');

/**
 * Read the required environment variables from process.env
 * and set them in the transfer state using defined above key.
 * This function is executed as an app initializer.
 */
export function transferStateFactory(transferState: TransferState) {
  return () => {
    const envVars = {
      cmsUrl: process.env.SSR_CMS_URL,
      buildInfo: process.env.SSR_BUILD_INFO,
      matomoSiteId: process.env.SSR_MATOMO_SITE_ID,
      profileApiUrl: process.env.SSR_PROFILE_API_URL,
      apiUrl: process.env.SSR_API_URL,
    };

    transferState.set<{ cmsUrl: string, buildInfo: string, profileApiUrl: string, apiUrl: string, matomoSiteId: string }>(ENV_KEY, envVars);
  };
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideAppInitializer(() => {
        const initializerFn = (transferStateFactory)(inject(TransferState));
        return initializerFn();
      }),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
