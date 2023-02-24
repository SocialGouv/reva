module View.Heading exposing (..)

import Html exposing (Html, text)
import Html.Attributes exposing (class)


h3 : String -> Html msg
h3 s =
    Html.h3
        [ class "w-[620px] -mt-4 mb-8"
        , class "text-2xl font-semibold uppercase text-blue-600"
        ]
        [ text s ]


h4 : String -> Html msg
h4 s =
    Html.h4
        [ class "w-[620px] my-4"
        , class "text-xl font-semibold uppercase text-slate-900"
        ]
        [ text s ]


h5 : String -> Html msg
h5 s =
    Html.h5
        [ class "w-[620px] mt-4 mb-3"
        , class "text-xl font-semibold text-slate-500"
        ]
        [ text s ]
