module View.Date exposing (toString)

import Time exposing (Month(..), Posix)


toString : Posix -> String
toString date =
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
    String.join " "
        [ String.fromInt <| Time.toDay Time.utc date
        , month
        , String.fromInt <| Time.toYear Time.utc date
        ]
