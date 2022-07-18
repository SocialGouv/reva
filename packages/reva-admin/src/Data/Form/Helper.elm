module Data.Form.Helper exposing (booleanFromString, booleanToString, dateFromString, dateToString, defaultDate, required, toDict)

import Data.Scalar exposing (Date)
import Dict
import Time


booleanToString : Bool -> String
booleanToString b =
    if b then
        "checked"

    else
        ""


booleanFromString : String -> Bool
booleanFromString b =
    case b of
        "checked" ->
            True

        _ ->
            False



-- TODO


dateFromString : String -> Date
dateFromString date =
    -- "1970-07-30"
    case String.split "-" date of
        [ a, b, c ] ->
            defaultDate

        _ ->
            defaultDate



-- TODO


dateToString : Date -> String
dateToString date =
    "1970-07-30"


defaultDate : Time.Posix
defaultDate =
    Time.millisToPosix 0


required :
    keys
    -> Dict.Dict String String
    -> (keys -> String)
    -> (String -> data)
    -> data
    -> data
required keys dict field f default =
    Dict.get (field keys) dict
        |> Maybe.map f
        |> Maybe.withDefault default


toDict : a -> List ( a -> comparable, Maybe String ) -> Dict.Dict comparable String
toDict keys data =
    List.map
        (\( f, value ) -> ( f keys, value |> Maybe.withDefault "" ))
        data
        |> Dict.fromList
