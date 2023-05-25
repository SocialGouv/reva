module Api.Form.Candidate exposing (get, update)

import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.Candidate
import Admin.Object.Degree
import Admin.Object.VulnerabilityIndicator
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.Degree
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Api.VulnerabilityIndicator
import Data.Candidacy
import Data.Candidate
import Data.Form exposing (FormData)
import Data.Form.Candidate
import Data.Referential
import Dict exposing (Dict)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


get :
    String
    -> String
    -> Token
    -> (RemoteData (List String) (Dict String String) -> msg)
    -> Cmd msg
get email endpointGraphql token toMsg =
    let
        candidateRequiredArgs =
            Query.CandidateGetCandidateByEmailRequiredArguments email
    in
    Query.candidate_getCandidateByEmail candidateRequiredArgs selection
        |> Auth.makeQuery endpointGraphql token (nothingToError "Ce candidat est introuvable" >> toMsg)


update :
    String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> FormData
    -> Cmd msg
update endpointGraphql token toMsg _ formData =
    let
        candidate =
            Data.Form.Candidate.fromDict formData

        maybeToOptional : Maybe a -> OptionalArgument a
        maybeToOptional arg =
            Maybe.map Present arg
                |> Maybe.withDefault Absent

        candidateInput =
            Admin.InputObject.FullCandidateInput
                (Present candidate.gender)
                (Present candidate.firstname)
                (maybeToOptional candidate.firstname2)
                (maybeToOptional candidate.firstname3)
                (Present candidate.lastname)
                Absent
                Absent
                (maybeToOptional <| Maybe.map Uuid candidate.highestDegreeId)
                (maybeToOptional <| Maybe.map Uuid candidate.vulnerabilityIndicatorId)

        candidateRequiredArg =
            Mutation.CandidateUpdateCandidateRequiredArguments
                (Uuid <| candidate.id)
                candidateInput
    in
    Mutation.candidate_updateCandidate candidateRequiredArg SelectionSet.empty
        |> Auth.makeMutation endpointGraphql token toMsg


selection : SelectionSet (Dict String String) Admin.Object.Candidate
selection =
    let
        degreeIdSelection : SelectionSet String Admin.Object.Degree
        degreeIdSelection =
            SelectionSet.succeed identity
                |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Degree.id)

        vulnerabilityIndicatorIdSelection : SelectionSet String Admin.Object.VulnerabilityIndicator
        vulnerabilityIndicatorIdSelection =
            SelectionSet.succeed identity
                |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.VulnerabilityIndicator.id)
    in
    SelectionSet.succeed Data.Form.Candidate.candidate
        |> with (SelectionSet.map (\(Uuid id) -> id) Admin.Object.Candidate.id)
        |> with Admin.Object.Candidate.firstname
        |> with Admin.Object.Candidate.firstname2
        |> with Admin.Object.Candidate.firstname3
        |> with Admin.Object.Candidate.gender
        |> with (Admin.Object.Candidate.highestDegree degreeIdSelection)
        |> with Admin.Object.Candidate.lastname
        |> with (Admin.Object.Candidate.vulnerabilityIndicator vulnerabilityIndicatorIdSelection)
