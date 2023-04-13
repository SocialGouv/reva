module View.Steps exposing (info, link, view)

import Html exposing (Html, a, div, label, li, ol, span, text)
import Html.Attributes exposing (attribute, class, classList)


view :
    Html msg
    -> Int
    ->
        List
            { navigation : Maybe (Html.Attribute msg)
            , content : List (Html msg)
            }
    -> Html msg
view header currentStepIndex timelineElements =
    let
        maybeLink index element =
            case element.navigation of
                Nothing ->
                    div [ class "relative flex items-start font-medium group" ]

                Just navigation ->
                    a
                        [ navigation
                        , class "cursor-pointer relative flex items-start group"
                        , classList
                            [ ( "text-blue-900 font-semibold", index == currentStepIndex )
                            , ( "font-medium", index /= currentStepIndex )
                            ]
                        ]

        viewNavigationTimelineStep index element =
            li
                [ class "relative border-l-2"
                , classList
                    [ ( "border-blue-900", index + 1 < currentStepIndex )
                    , ( "pt-6", index /= 0 )
                    ]
                ]
                [ maybeLink index
                    element
                    [ span [ class "ml-6 min-w-0 flex flex-col" ] element.content ]
                ]
    in
    ol
        [ class "mb-8 pl-2" ]
    <|
        (header
            :: List.indexedMap viewNavigationTimelineStep timelineElements
        )


linkHelper : String -> Html msg
linkHelper label =
    div
        [ class "text-sm mb-3" ]
        [ text label ]


link : String -> Html msg
link label =
    linkHelper label


info : String -> Html msg
info label =
    linkHelper label
