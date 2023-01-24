module Data.Form exposing (FormData, fromDict, fromDictFiles, get, getFiles, insert, insertFiles, toDict, toDictFiles)

import Bytes exposing (Bytes)
import Dict exposing (Dict)


type FormData
    = FormData
        { files : Dict String (List ( String, Bytes ))
        , string : Dict String String
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
    FormData { files = Dict.empty, string = dict }



-- FILES


insertFiles : String -> List ( String, Bytes ) -> FormData -> FormData
insertFiles key value (FormData formData) =
    FormData { formData | files = Dict.insert key value formData.files }


getFiles : String -> FormData -> List ( String, Bytes )
getFiles key (FormData formData) =
    Dict.get key formData.files
        |> Maybe.withDefault []


toDictFiles : FormData -> Dict String (List ( String, Bytes ))
toDictFiles (FormData formData) =
    formData.files


fromDictFiles : Dict String (List ( String, Bytes )) -> FormData
fromDictFiles dict =
    FormData { files = dict, string = Dict.empty }
