module Api.RemoteData exposing (nothingToError)

import RemoteData exposing (RemoteData(..))


nothingToError : String -> RemoteData (List String) (Maybe a) -> RemoteData (List String) a
nothingToError failureMessage remoteData =
    case remoteData of
        Success Nothing ->
            Failure [ failureMessage ]

        Success (Just candidacy) ->
            Success candidacy

        Failure e ->
            Failure e

        NotAsked ->
            NotAsked

        Loading ->
            Loading
