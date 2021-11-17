module View.Icons exposing (candidates, chevronLeft, close, dot, filter, mail, menu, pending, search, signout, success, user, userLarge)

import Html.Styled exposing (Html)
import Html.Styled.Attributes as Attr exposing (attribute)
import Svg.Styled as Svg exposing (svg)
import Svg.Styled.Attributes exposing (..)



-- Icons from heroicons.com


candidates : Html msg
candidates =
    svg [ class "text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-6 w-6", fill "none", viewBox "0 0 24 24", stroke "currentColor" ]
        [ Svg.path [ strokeLinecap "round", strokeLinejoin "round", strokeWidth "2", d "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" ] [] ]


close : Html msg
close =
    svg [ class "h-6 w-6 text-white", fill "none", viewBox "0 0 24 24", stroke "currentColor", attribute "aria-hidden" "true" ]
        [ Svg.path [ strokeLinecap "round", strokeLinejoin "round", strokeWidth "2", d "M6 18L18 6M6 6l12 12" ] [] ]


menu : Html msg
menu =
    svg [ class "h-6 w-6", fill "none", viewBox "0 0 24 24", stroke "currentColor" ]
        [ Svg.path [ strokeLinecap "round", strokeLinejoin "round", strokeWidth "2", d "M4 6h16M4 12h16M4 18h7" ] [] ]


search : Html msg
search =
    svg [ class "h-5 w-5", viewBox "0 0 20 20", fill "currentColor" ]
        [ Svg.path [ fillRule "evenodd", d "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z", clipRule "evenodd" ] [] ]


filter : Html msg
filter =
    svg [ class "h-5 w-5 text-gray-400", viewBox "0 0 20 20", fill "currentColor" ]
        [ Svg.path [ fillRule "evenodd", d "M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z", clipRule "evenodd" ] [] ]


signout : Html msg
signout =
    svg [ class "text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-6 w-6", viewBox "0 0 20 20", fill "currentColor" ]
        [ Svg.path [ fillRule "evenodd", d "M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z", clipRule "evenodd" ] [] ]


chevronLeft : Html msg
chevronLeft =
    svg [ class "-ml-2 h-5 w-5 text-gray-400", viewBox "0 0 20 20", fill "currentColor" ]
        [ Svg.path [ fillRule "evenodd", d "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z", clipRule "evenodd" ] [] ]


mail : Html msg
mail =
    svg [ class "-ml-1 mr-2 h-5 w-5 text-gray-400", viewBox "0 0 20 20", fill "currentColor" ]
        [ Svg.path [ d "M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" ] [], Svg.path [ d "M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" ] [] ]


user : Html msg
user =
    svg [ class "h-8 w-8", viewBox "0 0 20 20", fill "currentColor" ]
        [ Svg.path [ fillRule "evenodd", d "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z", clipRule "evenodd" ] [] ]


userLarge : Html msg
userLarge =
    svg [ class "h-24 w-24", viewBox "0 0 20 20", fill "currentColor" ]
        [ Svg.path [ fillRule "evenodd", d "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z", clipRule "evenodd" ] [] ]



-- Badge


dot : Html msg
dot =
    svg
        [ fill "currentColor"
        , viewBox "0 0 8 8"
        ]
        [ Svg.circle [ cx "4", cy "4", r "3" ] [] ]



-- Timeline icons


success : Html msg
success =
    svg
        [ class "h-4 w-4 text-white"
        , viewBox "0 0 20 20"
        , fill "currentColor"
        , Attr.attribute "aria-hidden" "true"
        ]
        [ Svg.path
            [ fillRule "evenodd"
            , d "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            , clipRule "evenodd"
            ]
            []
        ]


pending : Html msg
pending =
    svg
        [ class "h-4 w-4 text-white"
        , viewBox "0 0 20 20"
        , fill "currentColor"
        ]
        [ Svg.path
            [ d "M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" ]
            []
        ]
