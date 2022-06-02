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
import Json.Decode
import RemoteData exposing (RemoteData)


makeQueryRequestToSimpleResult :
    String
    -> (Result (List String) decodesTo -> msg)
    -> SelectionSet decodesTo Graphql.Operation.RootQuery
    -> Cmd msg
makeQueryRequestToSimpleResult endpointGraphql msg query =
    query
        |> Graphql.Http.queryRequest endpointGraphql
        --|> Graphql.Http.withCredentials
        |> Graphql.Http.send (Result.mapError graphqlHttpErrorToString >> msg)


simpleGraphqlHttpErrorToString : Graphql.Http.HttpError -> String
simpleGraphqlHttpErrorToString httpError =
    case httpError of
        Graphql.Http.BadUrl url ->
            "This URL is invalid:" ++ url

        Graphql.Http.Timeout ->
            "It took too long to get a response"

        Graphql.Http.NetworkError ->
            "The network is not available"

        Graphql.Http.BadStatus metadata body ->
            "The request failed with a "
                ++ String.fromInt metadata.statusCode
                ++ " status code and the following body response: "
                ++ body

        Graphql.Http.BadPayload err ->
            "The payload was unexpected: "
                ++ Json.Decode.errorToString err


graphqlHttpErrorToString : Graphql.Http.Error a -> List String
graphqlHttpErrorToString error =
    case error of
        Graphql.Http.HttpError httpError ->
            [ simpleGraphqlHttpErrorToString httpError ]

        Graphql.Http.GraphqlError _ errors ->
            List.map
                (\err -> err.message)
                errors


toRemote : Result (List String) a -> RemoteData String a
toRemote r =
    Result.mapError (String.join "\n") r
        |> RemoteData.fromResult


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
    -> (RemoteData String Data.Candidacies.Candidacies -> msg)
    -> Cmd msg
requestCandidacies endpointGraphql toMsg =
    makeQueryRequestToSimpleResult endpointGraphql (toRemote >> toMsg) getCandidacies
