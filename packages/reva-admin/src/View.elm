module View exposing (image, primaryButton, primaryLink, secondaryButton, skeleton, title)

import Html.Styled as Html exposing (Html, a, button, div, h2, img, nav, span, text)
import Html.Styled.Attributes exposing (attribute, class, href, src, type_)
import Html.Styled.Events exposing (onClick)
import Url.Builder
import View.Icons as Icons


mobileMenu : { a | onLogout : msg } -> Html msg
mobileMenu config =
    div
        -- TODO: Implement open/close mobile menu
        [ class "hidden fixed inset-0 flex z-40 lg:hidden", attribute "role" "dialog", attribute "aria-modal" "true" ]
        [ div
            [ class "fixed inset-0 bg-gray-600 bg-opacity-75", attribute "aria-hidden" "true" ]
            []
        , div
            [ class "relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white" ]
            [ div
                [ class "absolute top-0 right-0 -mr-12 pt-2" ]
                [ button
                    [ type_ "button", class "ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" ]
                    [ span
                        [ class "sr-only" ]
                        [ text "Close sidebar" ]
                    , Icons.close
                    ]
                ]
            , div
                [ class "flex-shrink-0 flex items-center px-4" ]
                [ text "REVA"
                ]
            , div
                [ class "mt-5 flex-1 h-0 overflow-y-auto" ]
                [ nav
                    [ class "px-2 space-y-1" ]
                    [ a
                        [ href "#", class "text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md" ]
                        [ Icons.candidates
                        , text "Candidats"
                        ]
                    , button
                        [ onClick config.onLogout, class "bg-gray-100 text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md" ]
                        [ Icons.signout
                        , text "Déconnexion"
                        ]
                    ]
                ]
            ]
        , div
            -- Force sidebar to shrink to fit close icon
            [ class "flex-shrink-0 w-14", attribute "aria-hidden" "true" ]
            []
        ]


sideMenu : { a | onLogout : msg } -> Html msg
sideMenu config =
    div
        [ class "flex-1 flex flex-col flex-grow min-h-0 border-r border-gray-200 pt-5 bg-gray-100 overflow-y-auto" ]
        [ div
            [ class "flex flex-col items-center justify-center items-start flex-shrink-0 px-4" ]
            [ span [ class "font-bold text-xs" ] [ text "REVA" ]
            ]
        , div
            [ class "mt-5 flex-grow flex flex-col" ]
            [ nav
                [ class "flex-1 px-2 pb-4 space-y-1" ]
                [ a
                    [ href "#", class "bg-gray-200 text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md" ]
                    [ Icons.candidates
                    , span [ class "hidden" ] [ text "Candidats" ]
                    ]
                , button
                    [ onClick config.onLogout, class "w-full text-gray-900 group flex items-center px-2 py-2 text-sm font-base hover:font-medium rounded-md" ]
                    [ Icons.signout
                    , span [ class "hidden" ] [ text "Déconnexion" ]
                    ]
                ]
            ]
        ]


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


elementDefaultClass : Html.Attribute msg
elementDefaultClass =
    class "text-center mt-4 rounded px-6 py-2"


primaryElement : (List (Html.Attribute msg) -> List (Html a) -> b) -> List (Html.Attribute msg) -> String -> b
primaryElement el attributes label =
    el
        ([ elementDefaultClass
         , class "bg-blue-600 text-white hover:bg-blue-700"
         ]
            ++ attributes
        )
        [ text label ]


secondaryElement : (List (Html.Attribute msg) -> List (Html a) -> b) -> List (Html.Attribute msg) -> String -> b
secondaryElement el attributes label =
    el
        ([ elementDefaultClass
         , class "bg-gray-400 text-white hover:bg-gray-500"
         ]
            ++ attributes
        )
        [ text label ]


primaryButton : List (Html.Attribute msg) -> String -> Html msg
primaryButton =
    primaryElement button


secondaryButton : List (Html.Attribute msg) -> String -> Html msg
secondaryButton =
    secondaryElement button


primaryLink : List (Html.Attribute msg) -> String -> Html msg
primaryLink =
    primaryElement a


skeleton : String -> Html msg
skeleton extraClass =
    div
        [ class "animate-pulse rounded bg-gray-100"
        , class extraClass
        ]
        []
