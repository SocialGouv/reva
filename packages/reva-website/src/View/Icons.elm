module View.Icons exposing (..)

import Html.Styled exposing (Html)
import Html.Styled.Attributes exposing (attribute)
import Svg.Styled as Svg exposing (svg)
import Svg.Styled.Attributes exposing (..)



-- Icons from heroicons.com


close : Html msg
close =
    svg
        [ class "h-6 w-6", fill "none", viewBox "0 0 24 24", stroke "currentColor", attribute "aria-hidden" "true" ]
        [ Svg.path [ strokeLinecap "round", strokeLinejoin "round", strokeWidth "2", d "M6 18L18 6M6 6l12 12" ] [] ]


menu : Html msg
menu =
    svg
        [ class "h-6 w-6", fill "none", viewBox "0 0 24 24", stroke "currentColor" ]
        [ Svg.path [ strokeLinecap "round", strokeLinejoin "round", strokeWidth "2", d "M4 6h16M4 12h16M4 18h7" ] [] ]
