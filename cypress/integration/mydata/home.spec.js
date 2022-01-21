describe('MyData home page', () => {
  beforeEach(() => {});

  it('Should add a publication using Research.fi publications', () => {
    cy.myDataLogin();

    // Select publications dialog
    cy.get('[data-test-id="profile-summary-publication-row"]', {
      timeout: 10000,
    }).within(() => {
      cy.get('[data-test-id="publication-select-button"]').click();
    });

    // Open search dialog
    cy.get('[data-test-id="search-from-research-fi-link"]').click();

    // Search for publications by term, select first item
    cy.get('mat-dialog-container[id="search-from-research-fi-dialog"]').within(
      () => {
        cy.get('input[id="searchInput"]').type('antenni');
        cy.get('button').contains('Hae').click();

        cy.get('input[id="mat-checkbox-2-input"]').check({ force: true });
        cy.get('button').contains('Jatka').click();
      }
    );

    // Confirm and close first dialog
    cy.get('button').contains('Jatka').click();
  });
});
