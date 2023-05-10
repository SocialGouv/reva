module View.Header exposing (..)

import Accessibility exposing (a, button, div, header, li, nav, p, text, ul)
import Html.Attributes exposing (attribute, class, href, id, target, title)
import Route exposing (Route(..))
import View


view : { a | baseUrl : String } -> Accessibility.Html msg
view context =
    header
        [ attribute "role" "banner"
        , class "fr-header"
        , id "header-navigation"
        ]
        [ div
            [ class "fr-header__body" ]
            [ div
                [ class "fr-container" ]
                [ div
                    [ class "fr-header__body-row" ]
                    [ div
                        [ class "fr-header__brand fr-enlarge-link" ]
                        [ div
                            [ class "fr-header__brand-top" ]
                            [ div
                                [ class "fr-header__logo" ]
                                [ View.logo ]
                            , div
                                [ class "fr-header__navbar" ]
                                [ button
                                    [ class "fr-btn--menu fr-btn"
                                    , attribute "data-fr-opened" "false"
                                    , attribute "aria-controls" "header-menu-modal"
                                    , attribute "aria-haspopup" "menu"
                                    , id "button-menu-modal"
                                    , title "Menu"
                                    ]
                                    [ text "Menu" ]
                                ]
                            ]
                        , div
                            [ class "fr-header__service"
                            ]
                            [ a
                                [ attribute "title" "Accueil - Espace Professionnel"
                                , Route.href context.baseUrl (Route.Candidacies Route.emptyFilters)
                                ]
                                [ p
                                    [ class "fr-header__service-title" ]
                                    [ text "Reva / Espace Professionnel" ]
                                ]
                            , p
                                [ class "fr-header__service-tagline" ]
                                [ text "L'expérimentation qui vise à transformer, simplifier et accélérer la VAE." ]
                            ]
                        ]
                    , div
                        [ class "fr-header__tools" ]
                        [ div
                            [ class "fr-header__tools-links" ]
                            [ ul
                                [ class "fr-btns-group" ]
                                [ li
                                    []
                                    [ a
                                        [ class "fr-btn fr-icon-logout-box-r-line"
                                        , Route.href context.baseUrl Logout
                                        ]
                                        [ text "Se déconnecter" ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        , headerMenuModal
        ]


headerMenuModal : Accessibility.Html msg
headerMenuModal =
    let
        navItems =
            -- We don't have specific navigation items for the mobile modal
            []

        itemLink ( label, url ) =
            li
                [ class "fr-nav__item" ]
                [ a
                    [ class "fr-nav__link"
                    , href url
                    , target "_self"
                    ]
                    [ text label ]
                ]
    in
    div
        [ class "fr-header__menu fr-modal"
        , id "header-menu-modal"
        , attribute "aria-labelledby" "button-menu-modal"
        ]
        [ div
            [ class "fr-container" ]
            [ button
                [ class "fr-btn--close fr-btn"
                , attribute "aria-controls" "header-menu-modal"
                , title "Fermer"
                ]
                [ text "Fermer" ]
            , div
                [ class "fr-header__menu-links" ]
                []
            , nav
                [ class "fr-nav"
                , attribute "role" "navigation"
                , attribute "aria-label" "Menu principal"
                ]
                [ ul
                    [ class "fr-nav__list" ]
                  <|
                    List.map itemLink navItems
                ]
            ]
        ]
