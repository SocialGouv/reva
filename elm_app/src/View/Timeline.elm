module View.Timeline exposing (Event, Status(..), view)

import Css exposing (display, lastChild, none)
import Css.Global exposing (descendants, typeSelector)
import Html.Styled exposing (Html, div, li, p, span, text, time, ul)
import Html.Styled.Attributes exposing (attribute, class, css)
import View.Helpers exposing (dataTest)
import View.Icons as Icons


type Status
    = Accepted String
    | Commented String
    | Pending
    | Rejected String


type alias Event msg =
    { content : List (Html msg)
    , dataTest : String
    , status : Status
    , timestamp : Int
    }


view : String -> List (Event msg) -> Html msg
view id events =
    div
        [ dataTest id, class "flow-root w-full mb-8 border p-6 rounded-md" ]
        [ ul
            [ attribute "role" "list"
            , class "-mb-8"
            ]
          <|
            List.map viewEvent events
        ]


viewEvent : Event msg -> Html msg
viewEvent event =
    li
        [ dataTest <| statusToString event.status ++ "-" ++ event.dataTest
        , css
            [ lastChild
                [ descendants [ typeSelector ".divider" [ display none ] ] ]
            ]
        ]
        [ div
            [ class "relative pb-8" ]
            [ span
                [ class "divider absolute top-3 left-3 -ml-px h-full w-0.5 bg-gray-300"
                , attribute "aria-hidden" "true"
                ]
                []
            , div
                [ class "relative flex space-x-3" ]
                [ div
                    []
                    [ span
                        [ class "h-6 w-6 rounded-full flex items-center justify-center ring-8 ring-white"
                        , class <| statusToClass event.status
                        ]
                        [ statusToIcon event.status ]
                    ]
                , div
                    [ class "min-w-0 flex-1 pt-0.5 flex justify-between space-x-4" ]
                    [ div
                        []
                        [ p
                            [ class "text-sm text-gray-700"
                            ]
                            event.content
                        ]
                    , statusToDate event.status
                    ]
                ]
            ]
        ]


statusToClass : Status -> String
statusToClass status =
    case status of
        Accepted _ ->
            "bg-green-500"

        Commented _ ->
            "bg-blue-600"

        Pending ->
            "bg-gray-300"

        Rejected _ ->
            "bg-red-500"


statusToDate : Status -> Html msg
statusToDate status =
    let
        dateTime date =
            div
                [ class "text-right text-sm whitespace-nowrap text-gray-500" ]
                [ time [] [ text date ] ]
    in
    case status of
        Accepted date ->
            dateTime date

        Commented date ->
            dateTime date

        Pending ->
            text ""

        Rejected date ->
            dateTime date


statusToIcon : Status -> Html msg
statusToIcon status =
    case status of
        Accepted _ ->
            Icons.accepted

        Commented _ ->
            Icons.commented

        Pending ->
            Icons.pending

        Rejected _ ->
            Icons.rejected


statusToString : Status -> String
statusToString status =
    case status of
        Accepted _ ->
            "accepted"

        Commented _ ->
            "commented"

        Pending ->
            "pending"

        Rejected _ ->
            "rejected"
