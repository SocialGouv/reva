context("when I access the delete appointment confirmation page", () => {
  it("show the correct title and content", function () {
    cy.admin(
      "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3/delete-confirmation/?date=2025-01-01T09:00:00.000Z&candidateFirstName=John&candidateLastName=Doe",
    );

    cy.get('[data-test="appointment-delete-confirmation-page-title"]').should(
      "have.text",
      "Rendez-vous supprimé",
    );
    cy.get('[data-test="appointment-delete-confirmation-page-date"]').should(
      "have.text",
      "Le 01/01/2025 à 10:00",
    );
    cy.get(
      '[data-test="appointment-delete-confirmation-page-candidate"]',
    ).should("have.text", "Candidat : Doe John");
  });
});
