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
    cy.get('@directoryItems').last().contains('Williams Rory')
  })

  it('search by diploma', function () {
    cy.get('#search').type('Familles')
    cy.get('@directoryItems').should('have.length', 3)
    cy.get('@directoryItems').eq(1).contains('Amy Pond')
  })

  context('open candidate details', () => {
    it('show all survey dates', function () {
      cy.get('@directoryItems').eq(2).click()
      cy.get('[data-test=timeline] time').as('surveyDates')
      cy.get('@surveyDates').should('have.length', 2)
      cy.get('@surveyDates').eq(0).contains('20 oct. 2021, 11:53')
      cy.get('@surveyDates').eq(1).contains('2 nov. 2021, 15:56')
    })
  })
})
