module Api.FeatureFlipping exposing (..)

import Admin.Query as Query
import Api.Auth as Auth
import Api.Token exposing (Token)
import RemoteData exposing (RemoteData(..))


getActiveFeatures :
    String
    -> Token
    -> (RemoteData (List String) (List String) -> msg)
    -> Cmd msg
getActiveFeatures endpointGraphql token toMsg =
    Query.activeFeaturesForConnectedUser
        |> Auth.makeQuery "activeFeaturesForConnectedUser" endpointGraphql token toMsg
