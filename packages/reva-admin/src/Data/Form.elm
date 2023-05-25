module Data.Form exposing (FormData, empty, fromDict, fromDictFiles, get, getError, getFiles, getFirstError, insert, insertFiles, toDict, toDictFiles, withErrors)

import Dict exposing (Dict)
import File exposing (File)
import List.Extra


type FormData
    = FormData
        { files : Dict String (List ( String, File ))
        , string : Dict String String
        , errors : Dict String String
        }


empty : FormData
empty =
    FormData
        { files = Dict.empty
        , string = Dict.empty
        , errors = Dict.empty
        }



-- STRING


get : String -> FormData -> Maybe String
get key (FormData formData) =
    Dict.get key formData.string


insert : String -> String -> FormData -> FormData
insert key value (FormData formData) =
    FormData { formData | string = Dict.insert key value formData.string }


toDict : FormData -> Dict String String
toDict (FormData formData) =
    formData.string


fromDict : Dict String String -> FormData
fromDict dict =
    FormData { files = Dict.empty, string = dict, errors = Dict.empty }



-- FILES


insertFiles : String -> List ( String, File ) -> FormData -> FormData
insertFiles key value (FormData formData) =
    FormData { formData | files = Dict.insert key value formData.files }


getFiles : String -> FormData -> List ( String, File )
getFiles key (FormData formData) =
    Dict.get key formData.files
        |> Maybe.withDefault []


toDictFiles : FormData -> Dict String (List ( String, File ))
toDictFiles (FormData formData) =
    formData.files


fromDictFiles : Dict String (List ( String, File )) -> FormData
fromDictFiles dict =
    FormData { files = dict, string = Dict.empty, errors = Dict.empty }



-- ERRORS


getError : String -> FormData -> Maybe String
getError key (FormData formData) =
    Dict.get key formData.errors


getFirstError : List ( String, a ) -> FormData -> Maybe String
getFirstError elements (FormData formData) =
    List.map Tuple.first elements
        |> List.Extra.find (\key -> Dict.member key formData.errors)


withErrors : FormData -> List String -> FormData
withErrors (FormData formData) errors =
    let
        keys : List String
        keys =
            Dict.keys formData.string
                ++ Dict.keys formData.files

        -- All error messages like "input.elementId: This number should be less than 30"
        -- will be added to the inputErrors dict with the key "elementId"
        inputErrors : Dict String String
        inputErrors =
            List.foldl
                (\key dict ->
                    let
                        tag =
                            key ++ ":"
                    in
                    case List.Extra.find (\error -> String.startsWith tag error) errors of
                        Just error ->
                            Dict.insert key (String.replace tag "" error |> String.trim) dict

                        Nothing ->
                            dict
                )
                Dict.empty
                keys
    in
    FormData
        { formData | errors = inputErrors }
