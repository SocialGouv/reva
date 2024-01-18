module Api.Form.ReadyForJuryEstimatedDate exposing (get, set)

import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.Candidacy
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Data.Candidacy exposing (CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.ReadyForJuryEstimatedDate
import Data.Referential
import Dict exposing (Dict)
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


get :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData (List String) (Dict String String) -> msg)
    -> Cmd msg
get candidacyId endpointGraphql token toMsg =
    let
        requiredArgs =
            Query.GetCandidacyByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)
    in
    Query.getCandidacyById requiredArgs selection
        |> Auth.makeQuery "getCandidacyAppointment" endpointGraphql token (nothingToError "Cette candidature est introuvable" >> toMsg)


set :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> FormData
    -> Cmd msg
set candidacyId endpointGraphql token toMsg _ formData =
    let
        estimatedDate =
            Data.Form.ReadyForJuryEstimatedDate.estimatedDateFromDict formData

        requiredArgs =
            Mutation.CandidacySetReadyForJuryEstimatedAtRequiredArguments
                (Uuid <| Data.Candidacy.candidacyIdToString candidacyId)
                estimatedDate
    in
    Mutation.candidacy_setReadyForJuryEstimatedAt requiredArgs SelectionSet.empty
        |> Auth.makeMutation "setReadyForJuryEstimatedAt" endpointGraphql token toMsg


selection : SelectionSet (Dict String String) Admin.Object.Candidacy
selection =
    SelectionSet.succeed Data.Form.ReadyForJuryEstimatedDate.estimatedDate
        |> with Admin.Object.Candidacy.readyForJuryEstimatedAt
