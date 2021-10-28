module View.Label exposing (..)

import Html.Styled exposing (Html, div, text)
import Html.Styled.Attributes exposing (class)


error : String -> Html msg
error value_ =
    div [ class "text-red-500 mt-1 text-sm" ] [ text value_ ]
