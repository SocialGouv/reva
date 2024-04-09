module Page.Loading exposing (view)

import Data.Context exposing (Context)
import Html exposing (Html, div)
import Html.Attributes exposing (class)
import View


view : Context -> Html msg
view context =
    View.layout context
        ""
        []
        [ div
            [ class "h-screen px-8 pt-6" ]
            [ div [ class "animate-pulse bg-gray-100 w-96 h-16" ] [] ]
        ]
