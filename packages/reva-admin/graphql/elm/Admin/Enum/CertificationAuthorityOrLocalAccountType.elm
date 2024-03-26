-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Enum.CertificationAuthorityOrLocalAccountType exposing (..)

import Json.Decode as Decode exposing (Decoder)


type CertificationAuthorityOrLocalAccountType
    = CertificationAuthority
    | CertificationAuthorityLocalAccount


list : List CertificationAuthorityOrLocalAccountType
list =
    [ CertificationAuthority, CertificationAuthorityLocalAccount ]


decoder : Decoder CertificationAuthorityOrLocalAccountType
decoder =
    Decode.string
        |> Decode.andThen
            (\string ->
                case string of
                    "CERTIFICATION_AUTHORITY" ->
                        Decode.succeed CertificationAuthority

                    "CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT" ->
                        Decode.succeed CertificationAuthorityLocalAccount

                    _ ->
                        Decode.fail ("Invalid CertificationAuthorityOrLocalAccountType type, " ++ string ++ " try re-running the @dillonkearns/elm-graphql CLI ")
            )


{-| Convert from the union type representing the Enum to a string that the GraphQL server will recognize.
-}
toString : CertificationAuthorityOrLocalAccountType -> String
toString enum____ =
    case enum____ of
        CertificationAuthority ->
            "CERTIFICATION_AUTHORITY"

        CertificationAuthorityLocalAccount ->
            "CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT"


{-| Convert from a String representation to an elm representation enum.
This is the inverse of the Enum `toString` function. So you can call `toString` and then convert back `fromString` safely.

    Swapi.Enum.Episode.NewHope
        |> Swapi.Enum.Episode.toString
        |> Swapi.Enum.Episode.fromString
        == Just NewHope

This can be useful for generating Strings to use for <select> menus to check which item was selected.

-}
fromString : String -> Maybe CertificationAuthorityOrLocalAccountType
fromString enumString____ =
    case enumString____ of
        "CERTIFICATION_AUTHORITY" ->
            Just CertificationAuthority

        "CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT" ->
            Just CertificationAuthorityLocalAccount

        _ ->
            Nothing