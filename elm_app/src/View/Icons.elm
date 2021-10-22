module View.Icons exposing (candidats, close, menu, search, signout)

import Html.Styled.Attributes exposing (attribute)
import Svg.Styled as Svg exposing (svg)
import Svg.Styled.Attributes exposing (..)



-- Icons from heroicons.com


candidats =
    svg
        [ class "text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-6 w-6", fill "none", viewBox "0 0 24 24", stroke "currentColor" ]
        [ Svg.path [ strokeLinecap "round", strokeLinejoin "round", strokeWidth "2", d "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" ] [] ]


close =
    svg
        [ class "h-6 w-6 text-white", fill "none", viewBox "0 0 24 24", stroke "currentColor", attribute "aria-hidden" "true" ]
        [ Svg.path [ strokeLinecap "round", strokeLinejoin "round", strokeWidth "2", d "M6 18L18 6M6 6l12 12" ] [] ]


menu =
    svg
        [ class "h-6 w-6", fill "none", viewBox "0 0 24 24", stroke "currentColor" ]
        [ Svg.path [ strokeLinecap "round", strokeLinejoin "round", strokeWidth "2", d "M4 6h16M4 12h16M4 18h7" ] [] ]


search =
    svg
        [ class "h-5 w-5", viewBox "0 0 20 20", fill "currentColor" ]
        [ Svg.path [ fillRule "evenodd", d "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z", clipRule "evenodd" ] [] ]


signout =
    svg [ class "text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-6 w-6", viewBox "0 0 20 20", fill "currentColor" ]
        [ Svg.path [ fillRule "evenodd", d "M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z", clipRule "evenodd" ]
            []
        ]
