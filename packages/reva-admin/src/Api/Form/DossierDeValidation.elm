module Api.Form.DossierDeValidation exposing (set)

import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Candidacy exposing (CandidacyId)
import Data.Form exposing (FormData)
import Data.Referential
import Dict exposing (Dict)
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


set :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> FormData
    -> Cmd msg
set candidacyId endpointGraphql token toMsg _ formData =
    Cmd.none
