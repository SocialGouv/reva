module View.Skiplinks exposing (view)

import Accessibility exposing (a, div, li, nav, text, ul)
import Html.Attributes exposing (attribute, class, href, target)


view : Accessibility.Html msg
view =
    div
        [ class "fr-skiplinks" ]
        [ nav
            [ class "fr-container"
            , attribute "role" "navigation"
            , attribute "aria-label" "Accès rapide"
            ]
            [ ul
                [ class "fr-skiplinks__list" ]
                [ li
                    []
                    [ a
                        [ class "fr-link"
                        , href "#content"
                        , target "_self"
                        ]
                        [ text "Contenu" ]
                    ]
                , li
                    []
                    [ a
                        [ class "fr-link"
                        , href "#header-navigation"
                        , target "_self"
                        ]
                        [ text "Menu" ]
                    ]
                , li
                    []
                    [ a
                        [ class "fr-link"
                        , href "#footer"
                        , target "_self"
                        ]
                        [ text "Pied de page" ]
                    ]
                ]
            ]
        ]
