module Components.Atoms.SearchInput exposing (default, view)

import Html.Styled exposing (Html, input)


type alias Args =
    {}


default : Args
default =
    {}


view : Args -> Html msg
view _ =
    input [] []
