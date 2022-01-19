describe('MyData home page', () => {
  beforeEach(() => {});

  it('Should sign in progmatically to ORCID and log in to profile view', () => {
    cy.loginOidc();

    cy.visitMyDataRoute();

    cy.get('button').contains('Valikko').click();
    cy.get('a').contains('Kirjaudu sisään').click();
  });
});
