-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Enum.LegalStatus exposing (..)

import Json.Decode as Decode exposing (Decoder)


type LegalStatus
    = Ei
    | Eurl
    | Sarl
    | Sas
    | Sasu
    | Sa
    | Eirl
    | AssociationLoi1901
    | EtablissementPublic
    | Nc


list : List LegalStatus
list =
    [ Ei, Eurl, Sarl, Sas, Sasu, Sa, Eirl, AssociationLoi1901, EtablissementPublic, Nc ]


decoder : Decoder LegalStatus
decoder =
    Decode.string
        |> Decode.andThen
            (\string ->
                case string of
                    "EI" ->
                        Decode.succeed Ei

                    "EURL" ->
                        Decode.succeed Eurl

                    "SARL" ->
                        Decode.succeed Sarl

                    "SAS" ->
                        Decode.succeed Sas

                    "SASU" ->
                        Decode.succeed Sasu

                    "SA" ->
                        Decode.succeed Sa

                    "EIRL" ->
                        Decode.succeed Eirl

                    "ASSOCIATION_LOI_1901" ->
                        Decode.succeed AssociationLoi1901

                    "ETABLISSEMENT_PUBLIC" ->
                        Decode.succeed EtablissementPublic

                    "NC" ->
                        Decode.succeed Nc

                    _ ->
                        Decode.fail ("Invalid LegalStatus type, " ++ string ++ " try re-running the @dillonkearns/elm-graphql CLI ")
            )


{-| Convert from the union type representing the Enum to a string that the GraphQL server will recognize.
-}
toString : LegalStatus -> String
toString enum____ =
    case enum____ of
        Ei ->
            "EI"

        Eurl ->
            "EURL"

        Sarl ->
            "SARL"

        Sas ->
            "SAS"

        Sasu ->
            "SASU"

        Sa ->
            "SA"

        Eirl ->
            "EIRL"

        AssociationLoi1901 ->
            "ASSOCIATION_LOI_1901"

        EtablissementPublic ->
            "ETABLISSEMENT_PUBLIC"

        Nc ->
            "NC"


{-| Convert from a String representation to an elm representation enum.
This is the inverse of the Enum `toString` function. So you can call `toString` and then convert back `fromString` safely.

    Swapi.Enum.Episode.NewHope
        |> Swapi.Enum.Episode.toString
        |> Swapi.Enum.Episode.fromString
        == Just NewHope

This can be useful for generating Strings to use for <select> menus to check which item was selected.

-}
fromString : String -> Maybe LegalStatus
fromString enumString____ =
    case enumString____ of
        "EI" ->
            Just Ei

        "EURL" ->
            Just Eurl

        "SARL" ->
            Just Sarl

        "SAS" ->
            Just Sas

        "SASU" ->
            Just Sasu

        "SA" ->
            Just Sa

        "EIRL" ->
            Just Eirl

        "ASSOCIATION_LOI_1901" ->
            Just AssociationLoi1901

        "ETABLISSEMENT_PUBLIC" ->
            Just EtablissementPublic

        "NC" ->
            Just Nc

        _ ->
            Nothing
