module Data.Form.Helper exposing
    ( booleanFromString
    , booleanToString
    , dateFromString
    , dateToString
    , decode
    , generic
    , maybe
    , selection
    , toCheckedList
    , toDict
    , toIdList
    , toKeyedList
    , uuidToCheckedList
    )

import Admin.Scalar exposing (Uuid(..))
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


maybe :
    keys
    -> Dict.Dict String String
    -> (keys -> String)
    -> Maybe String
maybe keys dict field =
    Dict.get (field keys) dict


generic :
    keys
    -> Dict.Dict String String
    -> (keys -> String)
    -> (String -> data)
    -> data
    -> data
generic keys dict field f default =
    maybe keys dict field
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


selection : Dict.Dict String String -> List { a | id : String } -> List String
selection dict referential =
    let
        isSelected item value =
            if value == "checked" then
                Just item.id

            else
                Nothing
    in
    List.filterMap
        (\item ->
            Dict.get item.id dict
                |> Maybe.andThen (isSelected item)
        )
        referential


decode :
    a
    -> Dict.Dict String String
    ->
        { bool : (a -> String) -> Bool -> Bool
        , date : (a -> String) -> Maybe Timestamp -> Maybe Timestamp
        , generic : (a -> String) -> (String -> data) -> data -> data
        , int : (a -> String) -> Int -> Int
        , list : List { b | id : String } -> List String
        , string : (a -> String) -> String -> String
        , maybe : { string : (a -> String) -> Maybe String }
        }
decode keys dict =
    { bool = bool keys dict
    , date = date keys dict
    , generic = generic keys dict
    , int = int keys dict
    , list = selection dict
    , string = string keys dict
    , maybe = { string = maybe keys dict }
    }


toKeyedList : a -> List ( a -> String, Maybe String ) -> List ( String, String )
toKeyedList keys data =
    List.filterMap
        (\( f, maybeValue ) -> Maybe.map (\value -> ( f keys, value )) maybeValue)
        data


uuidToCheckedList : List Uuid -> List ( String, String )
uuidToCheckedList l =
    List.map (\(Uuid id) -> ( id, "checked" )) l


toCheckedList : List String -> List ( String, String )
toCheckedList l =
    List.map (\id -> ( id, "checked" )) l


toIdList : List { a | id : String, label : String } -> List ( String, String )
toIdList l =
    List.map (\e -> ( e.id, e.label )) l


toDict : a -> List ( a -> String, Maybe String ) -> Dict.Dict String String
toDict keys data =
    toKeyedList keys data
        |> Dict.fromList
