module Data.Form.Helper exposing
    ( booleanFromString
    , booleanToString
    , dateFromString
    , dateToString
    , decimalFromString
    , decimalToString
    , decode
    , generic
    , maybe
    , selection
    , toCheckBoxDescriptionList
    , toCheckedList
    , toDict
    , toIdList
    , toKeyedList
    , uuidToCheckedList
    )

import Admin.Scalar exposing (Decimal, Uuid(..))
import Data.Form exposing (FormData)
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


decimalFromString : String -> Decimal
decimalFromString stringValue =
    Admin.Scalar.Decimal stringValue


decimalToString : Decimal -> String
decimalToString decimalValue =
    case decimalValue of
        Admin.Scalar.Decimal value ->
            value


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


date : keys -> Dict.Dict String String -> (keys -> String) -> Timestamp -> Timestamp
date keys dict key default =
    generic keys dict key dateFromString (Just default)
        |> Maybe.withDefault default


maybeDate : keys -> Dict.Dict String String -> (keys -> String) -> Maybe Timestamp -> Maybe Timestamp
maybeDate keys dict key default =
    generic keys dict key dateFromString default


int : keys -> Dict.Dict String String -> (keys -> String) -> Int -> Int
int keys dict key default =
    generic keys dict key (String.toInt >> Maybe.withDefault default) default


float : keys -> Dict.Dict String String -> (keys -> String) -> Float -> Float
float keys dict key default =
    generic keys dict key (String.toFloat >> Maybe.withDefault default) default


decimal : keys -> Dict.Dict String String -> (keys -> String) -> Decimal -> Decimal
decimal keys dict key default =
    generic keys dict key decimalFromString default


string : keys -> Dict.Dict String String -> (keys -> String) -> String -> String
string keys dict key default =
    generic keys dict key identity default


selection : FormData -> List { a | id : String } -> List String
selection formData referential =
    let
        dict =
            Data.Form.toDict formData

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
    -> FormData
    ->
        { bool : (a -> String) -> Bool -> Bool
        , date : (a -> String) -> Timestamp -> Timestamp
        , generic : (a -> String) -> (String -> data) -> data -> data
        , int : (a -> String) -> Int -> Int
        , float : (a -> String) -> Float -> Float
        , decimal : (a -> String) -> Decimal -> Decimal
        , list : List { b | id : String } -> List String
        , string : (a -> String) -> String -> String
        , maybe : { date : (a -> String) -> Maybe Timestamp -> Maybe Timestamp, string : (a -> String) -> Maybe String }
        }
decode keys formData =
    let
        dict =
            Data.Form.toDict formData
    in
    { bool = bool keys dict
    , date = date keys dict
    , generic = generic keys dict
    , int = int keys dict
    , float = float keys dict
    , decimal = decimal keys dict
    , list = selection formData
    , string = string keys dict
    , maybe =
        { date = maybeDate keys dict
        , string = maybe keys dict
        }
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


toCheckBoxDescriptionList : Bool -> List { a | id : String, label : String } -> List { id : String, label : String, disabled : Bool }
toCheckBoxDescriptionList disabled l =
    List.map (\e -> { id = e.id, label = e.label, disabled = disabled }) l
