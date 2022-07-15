module Data.Form.Helper exposing (booleanFromString, booleanToString)


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
