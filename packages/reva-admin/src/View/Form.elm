module View.Form exposing (column, columnAuto, intermediateTotal, summary, total, viewLabel, viewSelect)

import Accessibility exposing (Attribute, div, text)
import Html exposing (Html, label, option, select)
import Html.Attributes exposing (class, disabled, for, id, required, selected, value)
import Html.Events exposing (onInput)


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


viewLabel : String -> List (Html msg) -> Html msg
viewLabel elementId content =
    label
        [ for elementId
        , class "block mt-[6px] mb-[10px]"
        , class "uppercase text-xs font-semibold"
        ]
        content


viewSelect : String -> String -> String -> List ( String, String ) -> (String -> (String -> msg)) -> Html msg
viewSelect elementId label dataOrDefault choices msg =
    div [ class "min-w-[160px] xl:min-w-[228px] max-w-lg mb-6" ]
        [ div
            [ class "fr-select-group" ]
            [ viewLabel elementId [ text label ]
            , select
                [ class "fr-select"
                , id elementId
                , onInput (msg elementId)
                , required True
                ]
                (option
                    [ disabled True
                    , selected (dataOrDefault == "")
                    , value ""
                    ]
                    [ text "Sélectionner" ]
                    :: List.map (viewChoice dataOrDefault) choices
                )
            ]
        ]


viewChoice : String -> ( String, String ) -> Html msg
viewChoice currentChoiceId ( choiceId, choice ) =
    option
        [ selected (choiceId == currentChoiceId), value choiceId ]
        [ text choice ]


summary : String -> Html msg
summary s =
    column
        [ class "mb-2 sm:mb-0"
        , class "max-h-[180px] overflow-auto"
        , class "text-sm text-gray-500"
        ]
        [ text <|
            if String.isEmpty <| String.trim s then
                "Non précisé"

            else
                s
        ]
