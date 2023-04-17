module View.Header exposing (..)

import Accessibility exposing (a, br, div, header, li, p, text, ul)
import Html.Attributes exposing (attribute, class, href)
import Html.Attributes.Autocomplete exposing (ContactType(..))
import Route exposing (Route(..))


view : { a | baseUrl : String } -> Accessibility.Html msg
view context =
    header
        [ attribute "role" "banner"
        , class "fr-header"
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
                                [ p [ class "fr-logo" ] [ text "République", br [], text "française" ] ]
                            ]
                        , div
                            [ class "fr-header__service"
                            ]
                            [ a
                                [ attribute "title" "Accueil - Espace professionnel"
                                , Route.href context.baseUrl (Route.Candidacies Route.emptyFilters)
                                ]
                                [ p
                                    [ class "fr-header__service-title" ]
                                    [ text "Reva / Espace professionnel" ]
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
        ]
