module Data.Form.Helper exposing
    ( booleanFromString
    , booleanToString
    , dateFromString
    , dateToString
    , defaultDate
    , generic
    , parse
    , toDict
    )

import Data.Scalar exposing (Timestamp)
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


dateFromString : String -> Maybe Timestamp
dateFromString iso =
    Iso8601.toTime iso
        |> Result.map Just
        |> Result.withDefault Nothing


dateToString : Timestamp -> String
dateToString time =
    Date.fromPosix Time.utc time
        |> Date.toIsoString


defaultDate : Time.Posix
defaultDate =
    Time.millisToPosix 0


generic :
    keys
    -> Dict.Dict String String
    -> (keys -> String)
    -> (String -> data)
    -> data
    -> data
generic keys dict field f default =
    Dict.get (field keys) dict
        |> Maybe.map f
        |> Maybe.withDefault default


bool : keys -> Dict.Dict String String -> (keys -> String) -> Bool -> Bool
bool keys dict key default =
    generic keys dict key booleanFromString default


date : keys -> Dict.Dict String String -> (keys -> String) -> Maybe Timestamp -> Maybe Timestamp
date keys dict key default =
    generic keys dict key dateFromString default


int : keys -> Dict.Dict String String -> (keys -> String) -> Int -> Int
int keys dict key default =
    generic keys dict key (String.toInt >> Maybe.withDefault default) default


string : keys -> Dict.Dict String String -> (keys -> String) -> String -> String
string keys dict key default =
    generic keys dict key identity default


parse :
    a
    -> Dict.Dict String String
    ->
        { bool : (a -> String) -> Bool -> Bool
        , date : (a -> String) -> Maybe Timestamp -> Maybe Timestamp
        , generic : (a -> String) -> (String -> data) -> data -> data
        , int : (a -> String) -> Int -> Int
        , string : (a -> String) -> String -> String
        }
parse keys dict =
    { bool = bool keys dict
    , date = date keys dict
    , generic = generic keys dict
    , int = int keys dict
    , string = string keys dict
    }


toDict : a -> List ( a -> comparable, Maybe String ) -> Dict.Dict comparable String
toDict keys data =
    List.map
        (\( f, value ) -> ( f keys, value |> Maybe.withDefault "" ))
        data
        |> Dict.fromList
