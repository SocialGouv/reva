-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Enum.FeasibilityCategoryFilter exposing (..)

import Json.Decode as Decode exposing (Decoder)


type FeasibilityCategoryFilter
    = All
    | Pending
    | Rejected
    | Admissible
    | Incomplete
    | Archived
    | DroppedOut


list : List FeasibilityCategoryFilter
list =
    [ All, Pending, Rejected, Admissible, Incomplete, Archived, DroppedOut ]


decoder : Decoder FeasibilityCategoryFilter
decoder =
    Decode.string
        |> Decode.andThen
            (\string ->
                case string of
                    "ALL" ->
                        Decode.succeed All

                    "PENDING" ->
                        Decode.succeed Pending

                    "REJECTED" ->
                        Decode.succeed Rejected

                    "ADMISSIBLE" ->
                        Decode.succeed Admissible

                    "INCOMPLETE" ->
                        Decode.succeed Incomplete

                    "ARCHIVED" ->
                        Decode.succeed Archived

                    "DROPPED_OUT" ->
                        Decode.succeed DroppedOut

                    _ ->
                        Decode.fail ("Invalid FeasibilityCategoryFilter type, " ++ string ++ " try re-running the @dillonkearns/elm-graphql CLI ")
            )


{-| Convert from the union type representing the Enum to a string that the GraphQL server will recognize.
-}
toString : FeasibilityCategoryFilter -> String
toString enum____ =
    case enum____ of
        All ->
            "ALL"

        Pending ->
            "PENDING"

        Rejected ->
            "REJECTED"

        Admissible ->
            "ADMISSIBLE"

        Incomplete ->
            "INCOMPLETE"

        Archived ->
            "ARCHIVED"

        DroppedOut ->
            "DROPPED_OUT"


{-| Convert from a String representation to an elm representation enum.
This is the inverse of the Enum `toString` function. So you can call `toString` and then convert back `fromString` safely.

    Swapi.Enum.Episode.NewHope
        |> Swapi.Enum.Episode.toString
        |> Swapi.Enum.Episode.fromString
        == Just NewHope

This can be useful for generating Strings to use for <select> menus to check which item was selected.

-}
fromString : String -> Maybe FeasibilityCategoryFilter
fromString enumString____ =
    case enumString____ of
        "ALL" ->
            Just All

        "PENDING" ->
            Just Pending

        "REJECTED" ->
            Just Rejected

        "ADMISSIBLE" ->
            Just Admissible

        "INCOMPLETE" ->
            Just Incomplete

        "ARCHIVED" ->
            Just Archived

        "DROPPED_OUT" ->
            Just DroppedOut

        _ ->
            Nothing
