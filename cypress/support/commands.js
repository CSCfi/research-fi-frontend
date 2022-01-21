const mydataBaseUrl = 'https://localhost:5003/mydata/';

Cypress.Commands.add('visitMyDataRoute', (route) => {
  cy.visit(mydataBaseUrl + (route ? route : ''));
});

/*
 * OIDC Login
 * Login is handled with Cypress plugin which uses Puppeteer script.
 * This method bypasses cross domain issues which are triggered if
 * top level domain changes in Cypress.
 */

// Log in programmatically if user is not authenticated
Cypress.Commands.add('myDataLogin', () => {
  cy.visitMyDataRoute();
  cy.get('button').contains('Valikko').click();
  cy.get('a')
    .contains('Kirjaudu')
    .then(($loginLink) => {
      cy.log($loginLink);
      if ($loginLink.text() === 'Kirjaudu sisään') {
        cy.loginOidc();
        cy.get('a').contains('Kirjaudu').click();
      } else {
        cy.visitMyDataRoute('profile');
      }
    });
});

// Create cookie expiration.
const { getUnixTime } = require('date-fns');

const getFutureTime = (minutesInFuture) => {
  const time = new Date(new Date().getTime() + minutesInFuture * 60000);
  return getUnixTime(time);
};

// Create a cookie object.
const createCookie = (cookie) => {
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
};

// Login with ORCID.
Cypress.Commands.add('loginOidc', () => {
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

// Clear any storage (cookies, sessions).
Cypress.Commands.add('clearStorage', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});
