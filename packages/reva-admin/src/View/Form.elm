module View.Form exposing (column, columnAuto, intermediateTotal, summary, total)

import Accessibility exposing (Attribute, div, text)
import Html exposing (Html)
import Html.Attributes exposing (class)


column : List (Attribute Never) -> List (Html msg) -> Html msg
column extraAttributes content =
    div
        ([ class "w-full lg:w-[180px] xl:w-[190px]" ] ++ extraAttributes)
        content


columnAuto : List (Attribute Never) -> List (Html msg) -> Html msg
columnAuto extraAttributes content =
    div
        ([ class "w-full sm:w-[160px] lg:w-[160px] xl:w-[228px]" ] ++ extraAttributes)
        content


intermediateTotal : String -> String -> String -> Html msg
intermediateTotal label total1 total2 =
    div
        [ class "mb-2 flex flex-wrap items-end gap-x-4"
        , class "font-medium"
        ]
        [ column [ class "mb-2 lg:mb-0" ] [ text label ]
        , columnAuto [] [ text total1 ]
        , columnAuto [] [ text total2 ]
        ]


total : String -> String -> String -> Html msg
total label total1 total2 =
    div
        [ class "w-full flex flex-wrap -mt-2"
        , class "pl-3 lg:pl-5"
        , class "font-medium"
        ]
        [ column
            [ class "mr-5 mb-2 lg:mb-0"
            , class "text-lg font-semibold"
            ]
            [ text label ]
        , columnAuto [ class "mr-4" ] [ text total1 ]
        , columnAuto [ class "font-medium" ] [ text total2 ]
        ]


summary : String -> Html msg
summary s =
    column
        [ class "min-h-[80px] max-h-[180px] overflow-auto"
        , class "text-sm text-gray-500"
        ]
        [ text <|
            if s /= "" then
                s

            else
                "Non précisé"
        ]
