module Page.Loading exposing (view)

import Html exposing (Html, div, text)
import Html.Attributes exposing (class)
import View


view : Html msg
view =
    View.layout
        ""
        []
        []
        [ div
            [ class "h-screen px-8 pt-6" ]
            [ div [ class "animate-pulse bg-gray-100 w-96 h-16" ] [] ]
        ]
