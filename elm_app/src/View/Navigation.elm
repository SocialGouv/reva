module View.Navigation exposing (view)

import Html.Styled exposing (Html, button, nav, text)
import Html.Styled.Attributes exposing (attribute, class, classList, selected, type_)
import Html.Styled.Events exposing (onClick)


view : List ( String, msg, Bool ) -> Html msg
view items =
    nav
        [ class "-mb-px flex space-x-6", attribute "aria-label" "Tabs" ]
    <|
        List.map viewItem items


viewItem : ( String, msg, Bool ) -> Html msg
viewItem ( name, toMsg, selected ) =
    button
        [ type_ "button"
        , onClick toMsg
        , class "border-b-2 whitespace-nowrap py-2 font-medium text-sm"
        , classList
            [ ( "border-b-2 border-indigo-500 text-blue-600", selected )
            , ( "border-transparent text-gray-600 hover:text-gray-900", not selected )
            ]
        , if selected then
            attribute "aria-current" "page"

          else
            class ""
        ]
        [ text name ]
