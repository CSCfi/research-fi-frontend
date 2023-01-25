## Structure

Application is separated into 4 main modules:

- Layout
- Portal
- MyData
- Shared

From these modules both Portal ande MyData modules work as an independent projects and both serve their own purpose but are closely tied together. We use these as modules rather than Angular projects since in this case there is no need to develop and maintain an library for shared components.

Portal and MyData modules have project related settings that are activated depending on application route. Settings can be found at: `app/shared/services/app-settings.service`

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

## Layout Module

Simple module serving common UI elements, such as header, footer, review & error dialogs and component wrapper for dynamic content.

## Portal Module

Portal consists from few main content types: Informative pages, search results, news and science and research elsewhere -section.

### Informative pages

Informative pages, eg. `service-info` query data from exclusive [Research.fi CMS](https://github.com/CSCfi/research-fi-cms/tree/devel) system. We get this data via Angular Http Client module and render the route with resolver (in this case, page-resolver.service). All CMS data is stored in browsers session storage to avoid unnecessary API calls.

### Search results

Search results are split into different sections which we call as tabs:

- Publications
- People (beta)
- Projects
- Research data
- Funding calls
- Ingrastructures
- Organizations

Every section differs from each other by filters and layout and therefore have their own components. Components are mounted in main `results` component, which wraps filters, active-filters list and search results.
Search results are rendered in `search-results` component which attaches templates into Angular CDK Portal Outlet.

All search, filter and sorting logic are handled with url query parameters.

Incoming search result response is handled in Model-Adapter pattern. All the models are located in `portal/models`. Data is then rendered in corresponding component (eg. `results/publications`).

#### Result tab

List of tabs with result count for current search term.

#### Filters

Filters are rendered from aggregations that we query from ElasticSearch.
We query aggregations both with and without current search parameters. This is because we need all possible aggregation data in `active-filters` component.

Tab-based filtering logic is handled in `portal/services/filters`, where filter data is mapped for both `active-filters` and `filters` components.

#### Active filters list

Active filters list is rendered by query parameters in url. We check filter key against shaped aggregation data label.

#### Visualisations

Search result visualisations are made with `D3` library.

Visualisations consist of two main parts: first constructing the required aggregation queries to ElasticSearch and handling the response in a Model-Adapter pattern similarly to search results. Second,
constructing the actual visualisations from the data using the `D3` library.

The queries consist mainly of stacked `terms` aggregations. For publications, there is a single aggregation for each category. For fundings, however two top-level aggregations are needed, since funding amount information
exists in two different nested fields: `fundingGroupPerson` and `organizationConsortium`, these need to be handled separately. The structure of the queries can be found in `portal/services/static-data.service.ts`, while
the construction of the queries is implemented in `portal/services/filters/filter.service.ts`.

The construction of the visualisations is handled in components under `portal/components/visualisation`, one component for each type of visualisation.

### Science and Innovation Policy

This section has multiple collections of informative data for visualizing and explaining how research in Finland works.

All of the sub sections rely on data coming from CMS.

### News

`Search for news` tab works similar to main search results with shared filtering logic.

## MyData Module

Mydata -module is now in public BETA.

Authentication process of OIDC-library is started at the application root level when route matches `/mydata`.

Module consists of home, service deployment and profile areas.

In normal initial flow user starts deployment by agreeing to terms, authenticating with Suomi.fi and ORCID and importing data.

In profile editor user is able to make changes to publicity of user data. User is also able to import data that can be found in Research.fi portal (E.g. publications, datasets, projects...).

All changes in profile editor are stored in session storage allowing use of draft state for profile. Draft is deleted when changes are published.

Data and sources -route allows user to view data in larger, filtered sets. This view also allows user to do big patch operations.

## Shared Module

Shared -modules consists of components and services that should be reusable throughout application.

### Dynamic tables

We use `<app-table>` component for rendering dynamic tables. Table is created on top of Material UI Table component.
Pass data for table as column headers and rows. Row data consists of two objects: row cells and optional options. Row cells match property names to column headers.

Table cells are best suited for plain text. In some occasions we want to render row cells with more complex logic (see eg. `results/publications` route).
This is achieved by handling cell data as a template from parent: Create template inside of loop of rows in parent HTML, give template a template variable and access these variables in table data declaration.

Table can have leading column which consist of either icon or checkbox cells.

Sorting logic is handled with Material UI Sort header -component. Data sorting is handled either in parent component or in dedicated service. Sort parameters are emitted from table component on sort change.

Row can have an active status indicated with accent background color. Activate this status by adding `activeRowIdentifierField={fieldName}` property to component call.

In mobile version table rows can be rendered as cards by adding `[mobileCards]="true"` property. This feature is still in WIP state.
