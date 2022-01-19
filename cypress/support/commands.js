// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const mydataBaseUrl = 'https://localhost:5003/mydata/';

Cypress.Commands.add('visitMyDataRoute', (route) => {
  cy.visit(mydataBaseUrl + route);
});

/*
 * OIDC Login
 * Login is handled with Cypress plugin which uses Puppeteer script.
 * This method bypasses cross domain issues which are triggered if
 * top level domain changes in Cypress.
 */

const { getUnixTime } = require('date-fns');

/*
 * Create the cookie expiration.
 */
function getFutureTime(minutesInFuture) {
  const time = new Date(new Date().getTime() + minutesInFuture * 60000);
  return getUnixTime(time);
}

/**
 * Create a cookie object.
 * @param {*} cookie
 */
function createCookie(cookie) {
  return {
    name: cookie.name,
    value: cookie.value,
    options: {
      domain: `${cookie.domain.trimLeft('.')}`,
      expiry: getFutureTime(15),
      httpOnly: cookie.httpOnly,
      path: cookie.path,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
      session: cookie.session,
    },
  };
}

/**
 * Login with Auth0.
 */
Cypress.Commands.add('loginOidc', () => {
  // const existingCookies = sessions.auth0;
  // if (existingCookies) {
  //   cy.log('Loaded OIDC session from cache');

  //   cy.clearCookies();
  //   existingCookies.forEach((c) => cy.setCookie(c.name, c.value, c.options));
  //   return;
  // }

  cy.log('OIDC session not found, signing in');

  return cy
    .window()
    .then(() => {
      return cy.task('LoginPuppeteer');
    })
    .then(({ cookies }) => {
      cy.clearCookies({ domain: Cypress.env('OIDC_DOMAIN') });
      const oidcCookies = cookies.map(createCookie);
      oidcCookies.forEach((c) => cy.setCookie(c.name, c.value, c.options));
    });
});

/**
 * Clear any storage (cookies, sessions).
 */
Cypress.Commands.add('clearStorage', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});
