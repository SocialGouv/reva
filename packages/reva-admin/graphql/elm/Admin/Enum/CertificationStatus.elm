-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Enum.CertificationStatus exposing (..)

import Json.Decode as Decode exposing (Decoder)


type CertificationStatus
    = Inactive
    | Soon
    | Available


list : List CertificationStatus
list =
    [ Inactive, Soon, Available ]


decoder : Decoder CertificationStatus
decoder =
    Decode.string
        |> Decode.andThen
            (\string ->
                case string of
                    "INACTIVE" ->
                        Decode.succeed Inactive

                    "SOON" ->
                        Decode.succeed Soon

                    "AVAILABLE" ->
                        Decode.succeed Available

                    _ ->
                        Decode.fail ("Invalid CertificationStatus type, " ++ string ++ " try re-running the @dillonkearns/elm-graphql CLI ")
            )


{-| Convert from the union type representing the Enum to a string that the GraphQL server will recognize.
-}
toString : CertificationStatus -> String
toString enum____ =
    case enum____ of
        Inactive ->
            "INACTIVE"

        Soon ->
            "SOON"

        Available ->
            "AVAILABLE"


{-| Convert from a String representation to an elm representation enum.
This is the inverse of the Enum `toString` function. So you can call `toString` and then convert back `fromString` safely.

    Swapi.Enum.Episode.NewHope
        |> Swapi.Enum.Episode.toString
        |> Swapi.Enum.Episode.fromString
        == Just NewHope

This can be useful for generating Strings to use for <select> menus to check which item was selected.

-}
fromString : String -> Maybe CertificationStatus
fromString enumString____ =
    case enumString____ of
        "INACTIVE" ->
            Just Inactive

        "SOON" ->
            Just Soon

        "AVAILABLE" ->
            Just Available

        _ ->
            Nothing
