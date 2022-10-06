module View.Steps exposing (info, link, view)

import Html.Styled as Html exposing (Html, a, div, label, li, ol, span, text)
import Html.Styled.Attributes exposing (attribute, class, classList)


view :
    Int
    ->
        List
            { navigation : Maybe (Html.Attribute msg)
            , content : List (Html msg)
            }
    -> Html msg
view currentStepIndex timelineElements =
    let
        timelineSize =
            List.length timelineElements

        maybeLink element =
            case element.navigation of
                Nothing ->
                    div [ class "relative flex items-start group" ]

                Just navigation ->
                    a
                        [ navigation
                        , class "cursor-pointer relative flex items-start group"
                        ]

        viewNavigationTimelineStep index element =
            li
                [ class "pb-14 relative" ]
                [ if index + 1 == timelineSize then
                    text ""

                  else
                    div
                        [ class "-ml-px absolute mt-0.5 top-2 left-2.5 w-0.5 h-full"
                        , classList
                            [ ( "bg-gray-300", index >= currentStepIndex )
                            , ( "bg-blue-600", index < currentStepIndex )
                            ]
                        , attribute "aria-hidden" "true"
                        ]
                        []
                , maybeLink element
                    [ span
                        [ class "mt-1.5 flex items-center" ]
                        [ span
                            [ class "relative z-10 w-5 h-5 flex items-center justify-center rounded-full"
                            , class "border-2"
                            , classList
                                [ ( "border-gray-300", index > currentStepIndex )
                                , ( "border-blue-600", index <= currentStepIndex )
                                , ( "bg-gray-100 group-hover:bg-gray-200", index > currentStepIndex )
                                , ( "bg-white group-hover:bg-blue-200", index == currentStepIndex )
                                , ( "bg-blue-600 group-hover:bg-blue-400", index < currentStepIndex )
                                ]
                            ]
                            [ if index == currentStepIndex then
                                span [ class "bg-blue-600 w-2 h-2 rounded-full text-white" ] []

                              else if index < currentStepIndex then
                                span [ class "text-white text-xs font-bold" ] [ text "✓" ]

                              else
                                text ""
                            ]
                        ]
                    , span [ class "ml-6 min-w-0 flex flex-col" ] element.content
                    ]
                ]
    in
    div
        [ class "pl-12" ]
        [ ol
            [ attribute "role" "list"
            , class "-mt-8"
            ]
          <|
            List.indexedMap viewNavigationTimelineStep timelineElements
        ]


linkHelper : String -> Html msg -> Html msg
linkHelper label extraContent =
    div
        [ class "flex items-center justify-between w-60" ]
        [ span [ class "text-base" ] [ text label ]
        , extraContent
        ]


link : String -> Html msg
link label =
    linkHelper label <|
        span [ class "text-lg" ] [ text "→" ]


info : String -> Html msg
info label =
    linkHelper label (text "")
