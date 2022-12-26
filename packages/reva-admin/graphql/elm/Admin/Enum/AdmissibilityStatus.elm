-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Enum.AdmissibilityStatus exposing (..)

import Json.Decode as Decode exposing (Decoder)


type AdmissibilityStatus
    = Admissible
    | NotAdmissible


list : List AdmissibilityStatus
list =
    [ Admissible, NotAdmissible ]


decoder : Decoder AdmissibilityStatus
decoder =
    Decode.string
        |> Decode.andThen
            (\string ->
                case string of
                    "ADMISSIBLE" ->
                        Decode.succeed Admissible

                    "NOT_ADMISSIBLE" ->
                        Decode.succeed NotAdmissible

                    _ ->
                        Decode.fail ("Invalid AdmissibilityStatus type, " ++ string ++ " try re-running the @dillonkearns/elm-graphql CLI ")
            )


{-| Convert from the union type representing the Enum to a string that the GraphQL server will recognize.
-}
toString : AdmissibilityStatus -> String
toString enum____ =
    case enum____ of
        Admissible ->
            "ADMISSIBLE"

        NotAdmissible ->
            "NOT_ADMISSIBLE"


{-| Convert from a String representation to an elm representation enum.
This is the inverse of the Enum `toString` function. So you can call `toString` and then convert back `fromString` safely.

    Swapi.Enum.Episode.NewHope
        |> Swapi.Enum.Episode.toString
        |> Swapi.Enum.Episode.fromString
        == Just NewHope

This can be useful for generating Strings to use for <select> menus to check which item was selected.

-}
fromString : String -> Maybe AdmissibilityStatus
fromString enumString____ =
    case enumString____ of
        "ADMISSIBLE" ->
            Just Admissible

        "NOT_ADMISSIBLE" ->
            Just NotAdmissible

        _ ->
            Nothing
