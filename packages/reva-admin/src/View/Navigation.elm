module View.Navigation exposing (view)

import Html exposing (Html, button, nav, text)
import Html.Attributes exposing (attribute, class, classList, type_)
import Html.Events exposing (onClick)
import View.Helpers exposing (dataTest)


type alias Item msg =
    { name : String
    , dataTest : String
    , selected : Bool
    , toMsg : msg
    }


view : List (Item msg) -> Html msg
view items =
    nav
        [ class "-mb-px flex space-x-6", attribute "aria-label" "Tabs" ]
    <|
        List.map viewItem items


viewItem : Item msg -> Html msg
viewItem config =
    button
        [ dataTest config.dataTest
        , type_ "button"
        , onClick config.toMsg
        , class "border-b-2 whitespace-nowrap py-2 font-medium text-sm"
        , classList
            [ ( "border-b-2 border-indigo-500 text-blue-600", config.selected )
            , ( "border-transparent text-gray-600 hover:text-gray-900", not config.selected )
            ]
        , if config.selected then
            attribute "aria-current" "page"

          else
            class ""
        ]
        [ text config.name ]
