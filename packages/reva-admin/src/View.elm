module View exposing (backLink, image, infoBlock, layout, logo, skeleton, title)

import Accessibility exposing (a, br, h3, nav, p)
import Html exposing (Html, div, h2, img, node, text)
import Html.Attributes exposing (attribute, class, src)
import Html.Attributes.Extra exposing (role)
import Url.Builder


title : String -> Html msg
title s =
    h2
        [ class "text-4xl font-medium text-gray-900 leading-none"
        , class "mt-6 mb-10"
        ]
        [ text s ]


image : List (Html.Attribute msg) -> String -> String -> Html msg
image attributes baseUrl imgName =
    img ((src <| Url.Builder.absolute [ baseUrl, imgName ] []) :: attributes) []


skeleton : String -> Html msg
skeleton extraClass =
    div
        [ class "animate-pulse bg-gray-50"
        , class extraClass
        ]
        []


layout : List (Html msg) -> List (Html msg) -> Html msg
layout navContent content =
    node "main"
        [ role "main"
        , class "flex relative"
        ]
        [ div
            [ class "bg-gradient-to-r from-[#557AFF] to-[#2400FF]"
            , class "w-screen inset-x absolute z-0 pb-[400px]"
            ]
            []
        , div
            [ class "z-1 relative fr-container" ]
            [ div
                [ class "mt-20 fr-grid-row" ]
                [ div
                    [ class "fr-col-12 fr-col-md-4" ]
                    [ nav
                        [ role "navigation"
                        , class "hidden md:order-first md:flex md:flex-col flex-shrink-0"
                        , attribute "aria-label" "Menu latéral"
                        , class "fr-sidemenu"
                        ]
                        [ div
                            [ class "fr-sidemenu__inner"
                            , class "min-h-[480px] bg-white shadow pl-4"
                            ]
                            navContent
                        ]
                    ]
                , div
                    [ class "bg-white shadow"
                    , class "fr-col-12 fr-col-md-8 mb-24"
                    ]
                    content
                ]
            ]
        ]


backLink : Html.Attribute Never -> String -> Accessibility.Html msg
backLink linkAttribute label =
    a
        [ linkAttribute
        , class "fr-link fr-fi-arrow-left-line fr-link--icon-left"
        , class "my-4 text-lg"
        ]
        [ text label ]


infoBlock : String -> List (Html msg) -> Html msg
infoBlock label contents =
    div [ class "mb-6 px-6 py-6 bg-gray-100" ] <|
        h3 [ class "text-2xl font-bold mb-2" ] [ text label ]
            :: contents


logo : Accessibility.Html msg
logo =
    p [ class "fr-logo" ] [ text "République", br [], text "française" ]
