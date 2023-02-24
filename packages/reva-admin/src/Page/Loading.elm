module Page.Loading exposing (view)

import Html exposing (Html, div, text)
import Html.Attributes exposing (class)


view : Html msg
view =
    div [ class "h-screen flex flex-col items-center justify-center" ]
        [ div [ class "mb-4 font-bold text-normal" ] [ text "REVA" ]
        , text "Chargement..."
        ]
