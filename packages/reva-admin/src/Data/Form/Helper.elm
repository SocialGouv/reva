module Data.Form.Helper exposing (booleanFromString, booleanToString, required)

import Dict


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
