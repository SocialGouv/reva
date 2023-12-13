module View.Form exposing (column27percent, column33percent, column50percent, intermediateTotal, summary, total, viewLabel, viewSelect)

import Accessibility exposing (Attribute, div, text)
import Html exposing (Html, label, option, select)
import Html.Attributes exposing (class, disabled, for, id, required, selected, value)
import Html.Events exposing (onInput)


column27percent : List (Attribute Never) -> List (Html msg) -> Html msg
column27percent extraAttributes content =
    div
        ([ class "w-full md:w-[122px] lg:w-[180px] xl:w-[236px]" ] ++ extraAttributes)
        content


column33percent : List (Attribute Never) -> List (Html msg) -> Html msg
column33percent extraAttributes content =
    -- On desktop, you can have three 33% columns on the same row (even inside a form section block)
    -- We use fixed width instead of percentage in order to use them inside
    -- a section block while keeping alignments across the whole form (ex. funding form).
    div
        ([ class "w-full md:w-[150px] lg:w-[194px] xl:w-[250px]" ] ++ extraAttributes)
        content


column50percent : List (Attribute Never) -> List (Html msg) -> Html msg
column50percent extraAttributes content =
    div
        ([ class "w-full sm:w-full lg:w-[300px] xl:w-[382px]" ] ++ extraAttributes)
        content


intermediateTotal : String -> String -> String -> Html msg
intermediateTotal label total1 total2 =
    -- On desktop, inside a form section block (where this intermediateTotal is used)
    -- we have only space for one 27% column + two 33 columns
    div
        [ class "mb-2 flex flex-wrap items-end gap-x-4"
        , class "font-medium"
        ]
        [ column27percent [ class "mb-2 lg:mb-0" ] [ text label ]
        , column33percent [] [ text total1 ]
        , column33percent [] [ text total2 ]
        ]


total : String -> String -> String -> Html msg
total label total1 total2 =
    div
        [ class "w-full flex flex-wrap -mt-2"
        , class "pl-3 lg:pl-5"
        , class "font-medium"
        ]
        [ column27percent
            [ class "mr-5 mb-2 lg:mb-0"
            , class "text-lg font-semibold"
            ]
            [ text label ]
        , column33percent [ class "mr-4" ] [ text total1 ]
        , column33percent [ class "font-medium" ] [ text total2 ]
        ]


viewLabel : String -> List (Html msg) -> Html msg
viewLabel elementId content =
    label
        [ for elementId
        , class "block mt-[6px] mb-[10px]"
        , class "uppercase text-xs font-semibold"
        ]
        content


type alias SelectConfig msg =
    { elementId : String
    , label : String
    , dataOrDefault : String
    , choices : List ( String, String )
    , onInputMsg : String -> (String -> msg)
    }


viewSelect : SelectConfig msg -> Html msg
viewSelect config =
    div [ class "w-full md:w-[316px] lg:w-[404px] xl:w-[516px] mb-6" ]
        [ div
            [ class "fr-select-group" ]
            [ viewLabel config.elementId [ text config.label ]
            , select
                [ class "fr-select"
                , id config.elementId
                , onInput (config.onInputMsg config.elementId)
                , required True
                ]
                (option
                    [ disabled True
                    , selected (config.dataOrDefault == "")
                    , value ""
                    ]
                    [ text "Sélectionner" ]
                    :: List.map (viewChoice config.dataOrDefault) config.choices
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
    column27percent
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
