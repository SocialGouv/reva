module View.Icons exposing (accepted, add, candidates, checked, chevronLeft, close, commented, dot, filter, location, mail, menu, pending, rejected, search, signout, trash, user, userLarge)

import Html.Styled exposing (Html)
import Html.Styled.Attributes exposing (attribute)
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
    svg
        [ class "h-6 w-6", viewBox "0 0 24 24", stroke "currentColor" ]
        [ Svg.circle
            [ cx "12", cy "6", r "5.25", fill "none", strokeLinecap "round", strokeLinejoin "round", strokeWidth "1.5px" ]
            []
        , Svg.path
            [ d "M2.25,23.25a9.75,9.75,0,0,1,19.5,0", fill "none", strokeLinecap "round", strokeLinejoin "round", strokeWidth "1.5px" ]
            []
        ]


userLarge : Html msg
userLarge =
    svg [ class "h-24 w-24", viewBox "0 0 24 24", fill "currentColor" ]
        [ Svg.circle
            [ cx "12", cy "6", r "5.25", fill "none", stroke "#000000", strokeLinecap "round", strokeLinejoin "round", strokeWidth "1.5px" ]
            []
        , Svg.path
            [ d "M2.25,23.25a9.75,9.75,0,0,1,19.5,0", fill "none", stroke "#000000", strokeLinecap "round", strokeLinejoin "round", strokeWidth "1.5px" ]
            []
        ]


checked : Html msg
checked =
    svg
        [ class "h-6 w-6 text-blue-600"
        , viewBox "0 0 20 20"
        , fill "currentColor"
        , attribute "aria-hidden" "true"
        ]
        [ Svg.path
            [ fillRule "evenodd"
            , d "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            , clipRule "evenodd"
            ]
            []
        ]


add : Html msg
add =
    svg
        [ class "h-6 w-6 group-hover:text-blue-500 text-blue-600"
        , viewBox "0 0 20 20"
        , fill "currentColor"
        ]
        [ Svg.path
            [ fillRule "evenodd"
            , d "M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            , clipRule "evenodd"
            ]
            []
        ]


trash : Html msg
trash =
    svg
        [ class "h-5 w-5", fill "none", viewBox "0 0 24 24", stroke "currentColor" ]
        [ Svg.path
            [ strokeLinecap "round", strokeLinejoin "round", strokeWidth "1", d "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" ]
            []
        ]



-- Badge


dot : Html msg
dot =
    svg
        [ fill "currentColor"
        , viewBox "0 0 8 8"
        ]
        [ Svg.circle [ cx "4", cy "4", r "3" ] [] ]



-- Timeline icons


accepted : Html msg
accepted =
    svg
        [ class "h-4 w-4 text-white"
        , viewBox "0 0 20 20"
        , fill "currentColor"
        , attribute "aria-hidden" "true"
        ]
        [ Svg.path
            [ fillRule "evenodd"
            , d "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            , clipRule "evenodd"
            ]
            []
        ]


commented : Html msg
commented =
    svg
        [ class "h-4 w-4 text-white"
        , viewBox "0 0 20 20"
        , fill "currentColor"
        ]
        [ Svg.path
            [ attribute "fillrule" "evenodd"
            , d "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            , attribute "cliprule" "evenodd"
            ]
            []
        ]


pending : Html msg
pending =
    svg
        [ class "h-4 w-4 text-white"
        , viewBox "0 0 20 20"
        , fill "currentColor"
        , attribute "aria-hidden" "true"
        ]
        [ Svg.path
            [ d "M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" ]
            []
        ]


rejected : Html msg
rejected =
    svg
        [ class "h-4 w-4 text-white"
        , viewBox "0 0 20 20"
        , fill "currentColor"
        , attribute "aria-hidden" "true"
        ]
        [ Svg.path
            [ fillRule "evenodd"
            , d "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            , clipRule "evenodd"
            ]
            []
        ]


location : Html msg
location =
    svg
        [ class "h-6 w-6", viewBox "0 0 24 24", stroke "currentColor" ]
        [ Svg.path
            [ d "M19.75,8.25c0,4.221-2.933,6.649-5.131,9-1.316,1.408-2.369,6-2.369,6S11.2,18.661,9.887,17.257c-2.2-2.35-5.137-4.782-5.137-9.007a7.5,7.5,0,0,1,15,0Z", fill "none", strokeLinecap "round", strokeLinejoin "round", strokeWidth "1.5px" ]
            []
        , Svg.circle
            [ cx "12.25", cy "8.25", r "3", fill "none", strokeLinecap "round", strokeLinejoin "round", strokeWidth "1.5px" ]
            []
        ]
