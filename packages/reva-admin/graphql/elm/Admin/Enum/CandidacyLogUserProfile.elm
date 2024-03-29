-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Enum.CandidacyLogUserProfile exposing (..)

import Json.Decode as Decode exposing (Decoder)


type CandidacyLogUserProfile
    = Admin
    | Candidat
    | Certificateur
    | Aap


list : List CandidacyLogUserProfile
list =
    [ Admin, Candidat, Certificateur, Aap ]


decoder : Decoder CandidacyLogUserProfile
decoder =
    Decode.string
        |> Decode.andThen
            (\string ->
                case string of
                    "ADMIN" ->
                        Decode.succeed Admin

                    "CANDIDAT" ->
                        Decode.succeed Candidat

                    "CERTIFICATEUR" ->
                        Decode.succeed Certificateur

                    "AAP" ->
                        Decode.succeed Aap

                    _ ->
                        Decode.fail ("Invalid CandidacyLogUserProfile type, " ++ string ++ " try re-running the @dillonkearns/elm-graphql CLI ")
            )


{-| Convert from the union type representing the Enum to a string that the GraphQL server will recognize.
-}
toString : CandidacyLogUserProfile -> String
toString enum____ =
    case enum____ of
        Admin ->
            "ADMIN"

        Candidat ->
            "CANDIDAT"

        Certificateur ->
            "CERTIFICATEUR"

        Aap ->
            "AAP"


{-| Convert from a String representation to an elm representation enum.
This is the inverse of the Enum `toString` function. So you can call `toString` and then convert back `fromString` safely.

    Swapi.Enum.Episode.NewHope
        |> Swapi.Enum.Episode.toString
        |> Swapi.Enum.Episode.fromString
        == Just NewHope

This can be useful for generating Strings to use for <select> menus to check which item was selected.

-}
fromString : String -> Maybe CandidacyLogUserProfile
fromString enumString____ =
    case enumString____ of
        "ADMIN" ->
            Just Admin

        "CANDIDAT" ->
            Just Candidat

        "CERTIFICATEUR" ->
            Just Certificateur

        "AAP" ->
            Just Aap

        _ ->
            Nothing
