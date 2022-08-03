module Data.Form.Helper exposing (booleanFromString, booleanToString, dateFromString, dateToString, defaultDate, required, toDict)

import Data.Scalar exposing (Date)
import Date
import Dict
import Iso8601
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


dateFromString : String -> Maybe Date
dateFromString date =
    Iso8601.toTime date
        |> Result.map Just
        |> Result.withDefault Nothing
        |> Debug.log "string to date"



-- TODO


dateToString : Date -> String
dateToString date =
    Date.fromPosix Time.utc date
        |> Date.toIsoString
        |> Debug.log "date to string"


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
