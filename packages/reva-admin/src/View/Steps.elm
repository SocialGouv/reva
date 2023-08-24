module View.Steps exposing (info, link, view)

import Html exposing (Html, a, div, label, li, ol, span, text)
import Html.Attributes exposing (class, classList)


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
                        ]

        viewNavigationTimelineStep index element =
            li
                [ class "relative"
                , classList [ ( "my-4", index /= 0 ) ]
                ]
                [ maybeLink index
                    element
                    [ span [ class "min-w-0 flex flex-col" ] element.content ]
                ]
    in
    div
        [ class "md:ml-4" ]
    <|
        header
            :: [ ol
                    [ class "my-5" ]
                 <|
                    List.indexedMap viewNavigationTimelineStep timelineElements
               ]


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
