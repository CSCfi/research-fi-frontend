describe('MyData profile operations', () => {
  /*
   * Test if profile exists before trying to create a new profile.
   * Delete profile and loop test if existing profile is found.
   */
  it('Should create a profile', () => {
    const createProfile = () => {
      cy.visitMyDataRoute();

      cy.get('button').contains('Luo profiili').click();

      cy.myDataLogin();

      cy.get('button').contains('Aloita').click();

      cy.wait(5000);

      cy.location().then((loc) => {
        // Delete profile if profile already exists
        if (loc.pathname.includes('/profile')) {
          cy.get('button').contains('Poista profiili').click();
          // Confirm
          cy.get('mat-dialog-actions').within(() => {
            cy.get('button').contains('Poista').click();
          });

          createProfile();
        } else {
          // First step
          // Should get user name from ORCID
          cy.get('app-orcid-id-info').contains('E2E User');

          cy.get('button').contains('Avaa käyttöehdot').click();

          // 2nd step
          // Check user agreement checkboxes
          cy.get('input[id="mat-checkbox-1-input"]').check({ force: true });
          cy.get('input[id="mat-checkbox-2-input"]').check({ force: true });

          cy.get('button').contains('Jatka').click();

          // 3rd step
          cy.get('button').contains('Tuo').click();
        }
      });
    };

    createProfile();
  });
});
