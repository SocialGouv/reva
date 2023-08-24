module View.Header exposing (..)

import Accessibility exposing (a, button, div, header, li, span, text)
import Html.Attributes exposing (alt, attribute, class, href, id, style, target, title)
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
                                [ class "fr-header__operator" ]
                                [ a
                                    [ attribute "title" "Accueil - Espace professionnel"
                                    , Route.href context.baseUrl Route.Home
                                    ]
                                    [ View.image
                                        [ style "width" "9.0625rem"
                                        , alt "France VAE"
                                        ]
                                        context.baseUrl
                                        "fvae_logo.svg"
                                    ]
                                ]
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
                        ]
                    , div
                        [ class "fr-header__tools" ]
                        [ div
                            [ class "fr-header__tools-links" ]
                            [ span
                                [ class "fr-btns-group" ]
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
        , headerMenuModal
        ]


headerMenuModal : Accessibility.Html msg
headerMenuModal =
    let
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
            ]
        ]
