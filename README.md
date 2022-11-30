# Research.fi frontend

Frontend for Research.fi, a service offered by the Ministry of Education and Culture that collects and shares information on research conducted in Finland.

## Install and run

Requirements:

- Node 14.15.0
- Backend: https://github.com/CSCfi/research-fi-mydata
- CMS: https://github.com/CSCfi/research-fi-cms/tree/devel

Set app and auth configurations in `src/assets/config`

Install with `npm install`

Run with `ng serve`

App is localized with Angular i18n-library. Default locale is for Finnish language.

Localized builds can be served with `--configuration {locale}` flag. E.g: `ng serve --configuration en`

After installing and running, frontend can be found from `https://localhost:5003`.

## Tests

Run Karma-based tests with `npm run test`. Check code based TypeScript types with `npm run tsc`.

## Building

The app uses Angular Universal for server side rendering and therefore app needs to be built with `ssr` flag.

Running `npm run build:ssr` builds the app for production to the `dist` folder.

This build can be served locally with `npm run serve:ssr` command.

## Architecture

See [architecture](architecture.md).

## License

Research.fi interface is released under `MIT`, see [LICENSE](LICENSE).

