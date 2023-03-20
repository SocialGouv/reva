module View exposing (image, skeleton, title)

import Html exposing (Html, div, h2, img, text)
import Html.Attributes exposing (class, src)
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
        [ class "animate-pulse rounded bg-gray-100"
        , class extraClass
        ]
        []
