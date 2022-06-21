module Page.Loading exposing (view)

import Html.Styled exposing (Html, div, text)
import Html.Styled.Attributes exposing (class)


view : Html msg
view =
    div [ class "h-screen flex flex-col items-center justify-center" ]
        [ div [ class "mb-4 font-bold text-normal" ] [ text "REVA" ]
        , text "Chargement..."
        ]
