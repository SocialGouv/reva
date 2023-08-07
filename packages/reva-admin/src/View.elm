module View exposing (article, backLink, errors, image, infoBlock, layout, logo, popupErrors, skeleton, summaryBlock, title)

import Accessibility exposing (a, article, br, button, h3, h5, nav, p)
import Html exposing (Html, div, h2, img, node, text)
import Html.Attributes exposing (attribute, class, id, src)
import Html.Attributes.Extra exposing (role)
import Url.Builder
import View.Helpers exposing (dataTest)


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
        [ class "animate-pulse bg-gray-100"
        , class extraClass
        ]
        []


layout : String -> List (Html msg) -> List (Html msg) -> List (Html msg) -> Html msg
layout navButtonLabel upperNavContent navContent content =
    node "main"
        [ role "main"
        , class "flex relative"
        , id "content"
        ]
        [ div
            [ class "hidden md:block"
            , class "bg-gradient-to-r from-[#557AFF] to-[#2400FF]"
            , class "w-screen inset-x absolute z-0 pb-[400px]"
            ]
            []
        , div
            [ class "z-1 relative fr-container" ]
            [ div
                [ class "md:mt-20 fr-grid-row" ]
                [ div
                    [ class "fr-col-12 fr-col-md-4" ]
                    [ nav
                        [ role "navigation"
                        , attribute "aria-label" "Menu latéral"
                        , class "fr-sidemenu"
                        ]
                        [ if upperNavContent == [] then
                            div [] []

                          else
                            div
                                [ class "fr-sidemenu__inner"
                                , class "flex items-center pl-12 md:pl-8 mt-6 md:mt-0 md:h-24"
                                , class "bg-white md:shadow mb-4"
                                ]
                                upperNavContent
                        , div
                            [ class "py-2 fr-sidemenu__inner"
                            , class "md:min-h-[480px] pl-4 md:mb-48"
                            , class "bg-white md:shadow"
                            ]
                          <|
                            -- When the nav context is empty, we remove the wrapper.
                            -- As a result, on mobile, we can close the nav when browsing to a new page
                            if navContent == [] then
                                [ div [ class "h-6 mx-4 my-6 bg-gray-100" ] [] ]

                            else
                                [ button
                                    [ class "fr-sidemenu__btn"
                                    , attribute "aria-controls" "fr-sidemenu-wrapper"
                                    , attribute "aria-expanded" "false"
                                    ]
                                    [ text navButtonLabel ]
                                , div
                                    [ class "fr-collapse"
                                    , id "fr-sidemenu-wrapper"
                                    ]
                                    navContent
                                ]
                        ]
                    ]
                , div
                    [ class "bg-white sm:shadow"
                    , class "fr-col-12 fr-col-md-8 mb-24"
                    ]
                    content
                ]
            ]
        ]


article : String -> Html.Attribute Never -> String -> List (Accessibility.Html msg) -> Html msg
article dataTestValue backLinkRoute backLinkLabel content =
    div
        [ class "bg-white px-4 pt-0 sm:px-8 sm:pt-6"
        , dataTest dataTestValue
        ]
        [ backLink backLinkRoute backLinkLabel
        , Accessibility.article [ class "mt-6" ] content
        ]


errors : List String -> Html msg
errors l =
    div [ class "text-red-500", role "alert" ] <| List.map (\e -> div [] [ text e ]) l


popupErrors : List String -> Html msg
popupErrors messages =
    case messages of
        [] ->
            text ""

        _ ->
            div
                [ class "fixed z-[1000] top-12 sm:top-6 inset-x-0 pointer-events-none"
                , class "w-full flex flex-col items-center justify-center"
                ]
                [ div
                    [ class "mx-2 bg-white max-w-2xl"
                    , class "fr-alert fr-alert--error fr-alert--sm"
                    , role "alert"
                    ]
                  <|
                    h3 [ class "fr-alert__title" ] [ text "Une erreur est survenue" ]
                        :: List.map
                            (\error -> p [] [ text error ])
                            messages
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


summaryBlock : String -> List (Html msg) -> Html msg
summaryBlock titleValue content =
    div
        [ class "bg-gray-100 px-8 pt-6 pb-8" ]
        (h5
            [ class "text-2xl mb-4" ]
            [ text titleValue ]
            :: content
        )
