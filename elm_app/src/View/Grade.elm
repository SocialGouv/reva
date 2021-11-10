module View.Grade exposing (Grade(..), view)

import Html.Styled exposing (Html, div, span, text)
import Html.Styled.Attributes exposing (class)
import View.Helpers exposing (dataTest)
import View.Icons as Icons


type Grade
    = A
    | B
    | C
    | D


view : String -> Grade -> Html msg
view label grade =
    span
        [ dataTest "grade"
        , class "mr-2 mt-2 inline-flex items-center px-3 py-0.5 rounded-full text-gray-600 text-sm border"
        ]
        [ div
            [ class "-ml-1 mr-1.5 h-2 w-2"
            , class <| toTextColor grade
            ]
            [ Icons.dot ]
        , text label
        , text " : "
        , text <| toString grade
        ]


toString : Grade -> String
toString grade =
    case grade of
        A ->
            "A"

        B ->
            "B"

        C ->
            "C"

        D ->
            "D"


toTextColor : Grade -> String
toTextColor grade =
    case grade of
        A ->
            "text-green-500"

        B ->
            "text-yellow-500"

        C ->
            "text-yellow-700"

        D ->
            "text-red-800"
