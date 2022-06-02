module Request exposing (requestCandidacies)

import Admin.Object
import Admin.Object.CandidacySummary
import Admin.Object.Certification
import Admin.Query as Query
import Admin.Scalar exposing (Date(..), Id(..))
import Data.Candidacies
import Data.CandidacySummary
import Data.Certification
import Graphql.Http
import Graphql.Operation
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData)


makeQueryRequest :
    String
    -> (RemoteData (Graphql.Http.Error decodesTo) decodesTo -> msg)
    -> SelectionSet decodesTo Graphql.Operation.RootQuery
    -> Cmd msg
makeQueryRequest endpointGraphql msg query =
    query
        |> Graphql.Http.queryRequest endpointGraphql
        --|> Graphql.Http.withCredentials
        |> Graphql.Http.send (RemoteData.fromResult >> msg)


certificationSelection : SelectionSet Data.Certification.Certification Admin.Object.Certification
certificationSelection =
    SelectionSet.succeed Data.Certification.Certification
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Certification.id)
        |> with Admin.Object.Certification.label
        |> with Admin.Object.Certification.summary
        |> with Admin.Object.Certification.acronym
        |> with Admin.Object.Certification.level
        |> with Admin.Object.Certification.activities
        |> with Admin.Object.Certification.activityArea
        |> with Admin.Object.Certification.accessibleJobType
        |> with Admin.Object.Certification.abilities



--  |> with Admin.Object.Certification.codeRncp


candidacySummarySelection : SelectionSet Data.CandidacySummary.CandidacySummary Admin.Object.CandidacySummary
candidacySummarySelection =
    SelectionSet.succeed Data.CandidacySummary.CandidacySummary
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.CandidacySummary.id)
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.CandidacySummary.deviceId)
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.CandidacySummary.certificationId)
        |> with (SelectionSet.map (Maybe.map (\(Id id) -> id)) Admin.Object.CandidacySummary.companionId)
        |> with (Admin.Object.CandidacySummary.certification certificationSelection)
        |> with Admin.Object.CandidacySummary.phone
        |> with Admin.Object.CandidacySummary.email
        |> with (SelectionSet.map (\(Date date) -> date) Admin.Object.CandidacySummary.createdAt)


getCandidacies : SelectionSet (List Data.CandidacySummary.CandidacySummary) Graphql.Operation.RootQuery
getCandidacies =
    Query.getCandidacies candidacySummarySelection


requestCandidacies :
    String
    -> (RemoteData (Graphql.Http.Error Data.Candidacies.Candidacies) Data.Candidacies.Candidacies -> msg)
    -> Cmd msg
requestCandidacies endpointGraphql msg =
    makeQueryRequest endpointGraphql msg getCandidacies
