## Structure

Application is separated into 3 main modules:

- Portal
- MyData
- Shared

## Styling and theme

We use both [Angular Material](https://material.angular.io/) and [NGX Bootstrap](https://valor-software.com/ngx-bootstrap/#/) together. Bootstrap is mainly for grid and Material library for styled components.

Application wide basic styles can be found at app root level in `styles-custom.scss`, `styles-custom-palette.scss` and `styles-custom-expansion-panel.scss` files.

In component level, we use two different SCSS files: One for component styles and one for theming. Component theme files are imported in `styles-custom.scss`.

## Server side rendering

We use [Angular Universal](https://angular.io/guide/universal) for SSR. This helps on setting dynamic meta data for routes.
Current platform needs to be checked when using browser specific functions.

To build SSR-build, run `npm run build:ssr`
Serve SSR-build with `npm run serve:ssr`

Configuration can be found at root level in `server.ts`.

## Localization

Application is served in three different locales (FI, SV and EN). All translations are handled with Angular i18n internationalization tooling kit.
Translations are located in `src/i18n`. Base file `messages.xlf` is just a template and doesn't need to be updated.

See [Angular i18n guide](https://angular.io/guide/i18n).

## Cookies & Cookie consent

We use Matomo for tracking users. However current tracking usage doesn't require us to ask for user consent. See more in [Matomo FAQ section of tracking without consent](https://matomo.org/faq/new-to-piwik/how-do-i-use-matomo-analytics-without-consent-or-cookie-banner/)

Twitter embed plugin is used without cookies.

Users are able to disable all tracking in `/privacy` route.

## Portal

Portal consists from few main content types: Informative pages, search results, news and science and research elsewhere -section.

### Informative pages

Informative pages, eg. `service-info` query data from exclusive Research.fi CMS system. We get this data via Angular Http Client module and render the route with resolver (in this case, page-resolver.service). All CMS data is stored in browsers session storage to avoid unnecessary API calls.

### Search results

Search results are split into different sections which we call as tabs:

- Publications
- Persons (TODO)
- Projects
- Datasets
- Ingrastructures
- Research activities (TODO)
- Organizations

Every section differs from each other by filters and layout and therefore have their own components. Components are mounted in main `results` component, which wraps filters, active-filters list and search results.
Search results are rendered in `search-results` component which attaches templates into Angular CDK Portal Outlet.

All search, filter and sorting logic are handled with url query parameters.

Incoming search result response is handled in Model-Adapter pattern. All the models are located in `portal/models`. Data is then rendered in corresponding component (eg. `results/publications`).

#### Result tab

List of tabs with result count for current search term.

#### Filters

Filters are rendered from aggregations that we query from Elastic Search.
We query aggregations both with and without current search parameters. This is because we need all possible aggregation data in `active-filters` component.

Tab-based filtering logic is handled in `portal/services/filters`, where filter data is mapped for both `active-filters` and `filters` components.

#### Active filters list

Active filters list is rendered by query parameters in url. We check filter key against shaped aggregation data label.

#### Visualisations

Search result visualisations are made with `D3` library.

### News

`Search for news` tab works similar to main search results with shared filtering logic.

### Science and research elsewhere

This area consists of data gathered from Researh.fi CMS system.

## MyData

Mydata -module is still in WIP-state.

Authentication process is started at the application root level.

## Shared

Shared -modules consists of components and services that should be reusable throughout application.
