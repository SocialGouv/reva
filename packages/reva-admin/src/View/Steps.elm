module View.Steps exposing (info, link, view)

import Html exposing (Html, a, div, label, li, ol, span, text)
import Html.Attributes exposing (class, classList, target)


view :
    Html msg
    -> Int
    ->
        List
            { navigation : Maybe ( Html.Attribute msg, Bool )
            , content : List (Html msg)
            }
    -> Html msg
view header currentStepIndex timelineElements =
    let
        maybeLink index element =
            case element.navigation of
                Nothing ->
                    div [ class "relative flex items-start group" ]

                Just ( href, external ) ->
                    a <|
                        [ href
                        , class "cursor-pointer relative flex items-start group"
                        ]
                            ++ (if external then
                                    [ target "_self" ]

                                else
                                    []
                               )

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
        [ class "lg:ml-4" ]
    <|
        header
            :: [ ol
                    [ class "my-5 font-bold" ]
                 <|
                    List.indexedMap viewNavigationTimelineStep timelineElements
               ]


linkHelper : String -> Html msg
linkHelper label =
    div
        [ class "mb-3" ]
        [ text label ]


link : String -> Html msg
link label =
    linkHelper label


info : String -> Html msg
info label =
    linkHelper label
