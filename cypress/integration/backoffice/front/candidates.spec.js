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

  context('open candidate profile', () => {
    beforeEach(() => {
      cy.get('@directoryItems').eq(2).click()
      cy.get('button[data-test=profile]').click()
    })

    it('show all candidate info ', function () {
      cy.get('dd[data-test=phone-number]').should('contain', '0644332211')
      cy.get('dd[data-test=email]').should('contain', 'amy.pond@example.com')
      cy.get('dd[data-test=diplome]').should(
        'contain',
        'TP Assistant⋅e de Vie aux Familles (TP ADVF)'
      )
      cy.get('dd[data-test=city]').should('contain', 'Toulouse, Occitanie')
    })
  })

  context('open recognition module', () => {
    const loremIpsum =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut ut mauris elementum, eleifend lectus eget, finibus massa.'

    beforeEach(() => {
      cy.get('@directoryItems').eq(1).click()
      cy.get('button[data-test=recognition]').click()
    })

    it('recognize two skills', function () {
      cy.get('button[data-test=start-recognition]').click()

      cy.get('button[data-test=skill-1]').click()
      cy.get('textarea[data-test=situation]').type(loremIpsum)
      cy.get('button[data-test=confirm-recognition]').click()
      cy.get('div[data-test=candidate-skill]').should('have.length', 1)
      cy.get('button[data-test=restart-recognition]').click()

      cy.get('button[data-test=skill-4]').click()
      cy.get('textarea[data-test=situation]').type(loremIpsum)
      cy.get('button[data-test=confirm-recognition]').click()
      cy.get('div[data-test=candidate-skill]').should('have.length', 2)

      cy.get('button[data-test=close-popup]').click()
      cy.get('button[data-test=review-recognition]').click()
      cy.get('div[data-test=candidate-skill]').should('have.length', 2)
    })

    it('require a comment to be added after selection', function () {
      cy.get('button[data-test=start-recognition]').click()
      cy.get('button[data-test=skill-1]').click()
      cy.get('button[data-test=confirm-recognition]').click()
      // Invalid form, we still have the button
      cy.get('button[data-test=confirm-recognition]').should('exist')
    })

    it('can close recognition module', function () {
      cy.get('div[data-test=popup').should('not.exist')
      cy.get('button[data-test=start-recognition]').click()
      cy.get('div[data-test=popup').should('exist')

      // click close button
      cy.get('button[data-test=close-popup]').click()
      cy.get('div[data-test=popup').should('not.exist')

      cy.get('button[data-test=start-recognition]').click()
      cy.get('div[data-test=popup').should('exist')

      // click outside the popup
      cy.get('div[data-test=close-popup]').click({ force: true })
      cy.get('div[data-test=popup').should('not.exist')
    })
  })

  context('open candidate events', () => {
    it('show all survey dates', function () {
      cy.get('@directoryItems').eq(2).click()
      cy.get('[data-test=commented-survey] time').as('surveyDates')
      cy.get('@surveyDates').should('have.length', 2)
      cy.get('@surveyDates').eq(0).contains('2 nov. 2021, 15:56')
      cy.get('@surveyDates').eq(1).contains('20 oct. 2021, 11:53')
    })

    it('show a single pending survey event (one survey passed and reviewed)', function () {
      cy.get('@directoryItems').eq(0).click()
      cy.get('[data-test=pending-survey]').should('exist')
      cy.get('[data-test=pending-status]').should('not.exist')
    })

    it('show two pending events (one survey passed and not reviewed)', function () {
      cy.get('@directoryItems').eq(1).click()
      cy.get('[data-test=pending-survey]').should('exist')
      cy.get('[data-test=pending-status]').should('exist')
    })

    it('show a single pending status event (two surveys passed and submitted to jury)', function () {
      cy.get('@directoryItems').eq(2).click()
      cy.get('[data-test=pending-survey]').should('not.exist')
      cy.get('[data-test=pending-status]').should('exist')
    })

    it('show no pending status event when rejected', function () {
      cy.get('@directoryItems').eq(3).click()
      cy.get('[data-test=pending-survey]').should('not.exist')
      cy.get('[data-test=pending-status]').should('not.exist')
      cy.get('[data-test=rejected-status]').should('exist')
    })

    it('show two accepted status when rejected by jury', function () {
      cy.get('@directoryItems').eq(4).click()
      cy.get('[data-test=pending-survey]').should('not.exist')
      cy.get('[data-test=pending-status]').should('not.exist')
      cy.get('[data-test=rejected-status]').should('exist')
      cy.get('[data-test=accepted-status]').should('have.length', 2)
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
