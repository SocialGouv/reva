module View.Form exposing (getError, getMaybeError)

import Html.Styled exposing (Html, text)
import View.Label as Label


getError : a -> List ( a, String ) -> Html msg
getError field errors =
    List.filter (\tuple -> Tuple.first tuple == field) errors
        |> List.map (\tuple -> Label.error (Tuple.second tuple))
        |> List.head
        |> Maybe.withDefault (text "")


getMaybeError : a -> List ( a, String ) -> Maybe String
getMaybeError field errors =
    List.filter (\tuple -> Tuple.first tuple == field) errors
        |> List.map (\tuple -> Tuple.second tuple)
        |> List.head
