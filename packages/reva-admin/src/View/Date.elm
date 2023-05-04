module View.Date exposing (toDateWithLabels, toFullFormat, toSmallFormat)

import Data.Candidacy exposing (DateWithLabels)
import Time exposing (Month(..), Posix)


toFullFormat : Posix -> String
toFullFormat date =
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
    if Time.posixToMillis date == 0 then
        ""

    else
        String.join " "
            [ String.fromInt <| Time.toDay Time.utc date
            , month
            , String.fromInt <| Time.toYear Time.utc date
            ]


toSmallFormat : Posix -> String
toSmallFormat date =
    let
        month =
            case Time.toMonth Time.utc date of
                Jan ->
                    "01"

                Feb ->
                    "02"

                Mar ->
                    "03"

                Apr ->
                    "04"

                May ->
                    "05"

                Jun ->
                    "06"

                Jul ->
                    "07"

                Aug ->
                    "08"

                Sep ->
                    "09"

                Oct ->
                    "10"

                Nov ->
                    "11"

                Dec ->
                    "12"
    in
    String.join "/"
        [ Time.toDay Time.utc date |> String.fromInt |> (++) "0" |> String.right 2
        , month
        , String.fromInt <| Time.toYear Time.utc date
        ]


toDateWithLabels : Time.Posix -> DateWithLabels
toDateWithLabels posix =
    { posix = posix
    , smallFormat = toSmallFormat posix
    , fullFormat = toFullFormat posix
    }
