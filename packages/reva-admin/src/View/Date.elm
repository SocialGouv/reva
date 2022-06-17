module View.Date exposing (view)

import Html.Styled exposing (Html, span, text)
import Time exposing (Month(..), Posix)


view : Posix -> Html msg
view date =
    let
        month =
            case Time.toMonth Time.utc date of
                Jan ->
                    "janvier"

                Feb ->
                    "février"

                Mar ->
                    "mars"

                Apr ->
                    "avril"

                May ->
                    "mai"

                Jun ->
                    "juin"

                Jul ->
                    "juillet"

                Aug ->
                    "août"

                Sep ->
                    "septembre"

                Oct ->
                    "octobre"

                Nov ->
                    "novembre"

                Dec ->
                    "décembre"
    in
    span
        []
        [ text month
        , text " "
        , text <| String.fromInt <| Time.toYear Time.utc date
        ]
