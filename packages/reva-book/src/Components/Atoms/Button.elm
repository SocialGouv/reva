module Components.Atoms.Button exposing (ButtonType(..), newArgs, view, withDisabled, withOnClick, withType)

import Html.Styled as Html exposing (Html, text)
import Html.Styled.Attributes exposing (class, classList, disabled, type_)
import Html.Styled.Events exposing (onClick)


type ButtonType
    = Submit
    | Button


type alias Args msg =
    { label : String
    , type_ : ButtonType
    , disabled : Bool
    , onClick : Maybe msg
    }


buttonTypeAsString : ButtonType -> String
buttonTypeAsString inputType =
    case inputType of
        Submit ->
            "submit"

        Button ->
            "button"


newArgs : String -> Args msg
newArgs label =
    { label = label
    , type_ = Button
    , disabled = False
    , onClick = Nothing
    }


withType : ButtonType -> Args msg -> Args msg
withType buttonType args =
    { args | type_ = buttonType }


withDisabled : Bool -> Args msg -> Args msg
withDisabled isDisabled args =
    { args | disabled = isDisabled }


withOnClick : msg -> Args msg -> Args msg
withOnClick msg args =
    { args | onClick = Just msg }


view : Args msg -> Html msg
view args =
    Html.button
        [ type_ (buttonTypeAsString args.type_)
        , disabled args.disabled
        , class "order-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:order-1 sm:ml-3"
        , classList [ ( "hover:bg-primary-700", not args.disabled ), ( "cursor-not-allowed", args.disabled ) ]
        , Maybe.map onClick args.onClick |> Maybe.withDefault (class "")
        ]
        [ text args.label ]
