module Data.Form.Helper exposing (booleanToString)


booleanToString : Bool -> String
booleanToString b =
    if b then
        "checked"

    else
        ""
