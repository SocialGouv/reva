/// <reference types="cypress" />

describe('List all candidates', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'dummy')
    cy.intercept('/api/candidates', { fixture: 'candidates.json' }).as(
      'candidates'
    )
    cy.visit('/app/')
    cy.wait('@candidates')
    cy.get('[data-test=directory-item]').as('directoryItems')
  })

  it('displays the list of candidates', () => {
    cy.get('@directoryItems').should('have.length', 5)
    cy.get('@directoryItems').first().contains('Clara Oswald')
  })

  it('group the candidates by the first letter of their lastname', () => {
    // We have 4 groups (O, P, R, S)
    cy.get('[data-test=directory-group]').should('have.length', 4)

    // The first group is labelled 'O'
    cy.get('[data-test=directory-group-name]').first().contains('O')

    // The first group has 2 candidates (Oswald and O'Brienc)
    cy.get(
      '[data-test=directory-group]:first-child [data-test=directory-item]'
    ).should('have.length', 2)
  })

  it('search by firstname and lastname', function () {
    cy.get('#search').type('Mickey')
    cy.get('@directoryItems').should('have.length', 1)

    // When we type the full name "Mickey Smith", we still have a result
    cy.get('#search').type(' Smith')
    cy.get('@directoryItems').should('have.length', 1)
    cy.get('@directoryItems').first().contains('Mickey Smith')

    // When we clear the input, we display again all candidates
    cy.get('#search').clear()
    cy.get('@directoryItems').should('have.length', 5)
  })

  it('search by region', function () {
    cy.get('#search').type('Auvergne-Rhône-Alpes')
    cy.get('@directoryItems').should('have.length', 2)
    cy.get('@directoryItems').first().contains('Clara Oswald')
    cy.get('@directoryItems').last().contains('Rory Williams')
  })

  it('search by diploma', function () {
    cy.get('#search').type('Familles')
    cy.get('@directoryItems').should('have.length', 3)
    cy.get('@directoryItems').eq(1).contains('Amy Pond')
  })

  context('open candidate details', () => {
    it('show all survey dates', function () {
      cy.get('@directoryItems').eq(2).click()
      cy.get('[data-test=survey-timeline] time').as('surveyDates')
      cy.get('@surveyDates').should('have.length', 2)
      cy.get('@surveyDates').eq(0).contains()
      cy.get('@surveyDates').eq(1).contains('20 oct. 2021, 11:53')
    })

    it('show a link to pass again the survey', function () {
      const emailLink = `mailto:rory.williams@example.com?subject=[REVA] Je vous invite à passer à nouveau le questionnaire de l'expérimentation !&body=Bonjour Rory,\n%0A%0A\nDans le cadre de votre parcours VAE au sein de l'expérimentation REVA, je vous invite à remplir à nouveau le questionnaire avant la prochaine étape de votre accompagnement :\n%0A%0A\n%5B Description de la prochaine étape %5D\n%0A%0A\nhttps%3A%2F%2Freva.beta.gouv.fr%2Finscription%3Fdiplome%3D9bbc43a9-8b51-4feb-aab0-a1b2b49d27b2%26cohorte%3D84b3218a-a5bd-4e4b-b359-8562de9b04b7%26step%3Dwelcome\n%0A%0A\nVos réponses à ce questionnaire sont précieuses pour nous, afin d'évaluer votre perception du parcours expérimental auquel vous participez. Elles nous permettent d'améliorer et de faciliter la reconnaissance et la validation de votre expérience.\n%0A%0A\n%5B Signature %5D`
      cy.get('@directoryItems').eq(3).click()
      cy.get('[data-test=survey-invitation]').should(
        'have.attr',
        'href',
        emailLink
      )
    })

    it('show grades for all survey', function () {
      // This candidate passed two surveys, it has 4 grades (2 per survey)
      cy.get('@directoryItems').eq(2).click()
      cy.get('[data-test=grade]').should('have.length', 4)
      // Second survey
      cy.get('[data-test=grades]').eq(0).contains('Profil : A')
      cy.get('[data-test=grades]').eq(0).contains('Obtention : B')
      // First survey
      cy.get('[data-test=grades]').eq(1).contains('Profil : C')
      cy.get('[data-test=grades]').eq(1).contains('Obtention : D')

      // This candidate passed one survey
      cy.get('@directoryItems').eq(3).click()
      cy.get('[data-test=grade]').should('have.length', 2)
      cy.get('[data-test=grades]').eq(0).contains('Profil : D')
      cy.get('[data-test=grades]').eq(0).contains('Obtention : NC')
    })
  })
})
