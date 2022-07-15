module Request exposing (archiveCandidacy, deleteCandidacy, requestAppointment, requestCandidacies, requestCandidacy, requestReferential, takeOverCandidacy, updateAppointment)

import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.Candidacy
import Admin.Object.CandidacyStatus
import Admin.Object.CandidacySummary
import Admin.Object.CandidateGoal
import Admin.Object.Certification
import Admin.Object.Experience
import Admin.Object.Goal
import Admin.Object.Referential
import Admin.Query as Query
import Admin.Scalar exposing (Date(..), Id(..))
import Data.Candidacy exposing (CandidacyId)
import Data.Certification
import Data.Form.Appointment
import Data.Referential
import Dict exposing (Dict)
import Graphql.Http
import Graphql.Operation
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import Json.Decode
import RemoteData exposing (RemoteData(..))


toRemote : Result (List String) a -> RemoteData String a
toRemote r =
    Result.mapError (String.join "\n") r
        |> RemoteData.fromResult


makeQuery :
    String
    -> (RemoteData String decodesTo -> msg)
    -> SelectionSet decodesTo Graphql.Operation.RootQuery
    -> Cmd msg
makeQuery endpointGraphql msg query =
    query
        |> Graphql.Http.queryRequest endpointGraphql
        --|> Graphql.Http.withCredentials
        |> Graphql.Http.send (Result.mapError graphqlHttpErrorToString >> toRemote >> msg)


makeMutation :
    String
    -> (RemoteData String decodesTo -> msg)
    -> SelectionSet decodesTo Graphql.Operation.RootMutation
    -> Cmd msg
makeMutation endpointGraphql msg query =
    query
        |> Graphql.Http.mutationRequest endpointGraphql
        --|> Graphql.Http.withCredentials
        |> Graphql.Http.send (Result.mapError graphqlHttpErrorToString >> toRemote >> msg)


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


appointmentSelection : SelectionSet (Dict String String) Admin.Object.Candidacy
appointmentSelection =
    SelectionSet.succeed Data.Form.Appointment.appointment
        |> with Admin.Object.Candidacy.typology
        |> with Admin.Object.Candidacy.typologyAdditional
        |> with Admin.Object.Candidacy.firstAppointmentOccuredAt
        |> with Admin.Object.Candidacy.appointmentCount
        |> with Admin.Object.Candidacy.wasPresentAtFirstAppointment



-- CANDIDACY


candidacyStatusSelection : SelectionSet Data.Candidacy.CandidacyStatus Admin.Object.CandidacyStatus
candidacyStatusSelection =
    SelectionSet.succeed Data.Candidacy.CandidacyStatus
        |> with Admin.Object.CandidacyStatus.createdAt
        |> with Admin.Object.CandidacyStatus.status
        |> with Admin.Object.CandidacyStatus.isActive



--  |> with Admin.Object.Certification.codeRncp


candidacySummarySelection : SelectionSet Data.Candidacy.CandidacySummary Admin.Object.CandidacySummary
candidacySummarySelection =
    SelectionSet.succeed Data.Candidacy.CandidacySummary
        |> with (SelectionSet.map (\(Id id) -> Data.Candidacy.candidacyIdFromString id) Admin.Object.CandidacySummary.id)
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.CandidacySummary.deviceId)
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.CandidacySummary.certificationId)
        |> with (SelectionSet.map (Maybe.map (\(Id id) -> id)) Admin.Object.CandidacySummary.companionId)
        |> with (Admin.Object.CandidacySummary.certification certificationSelection)
        |> with Admin.Object.CandidacySummary.phone
        |> with Admin.Object.CandidacySummary.email
        |> with (Admin.Object.CandidacySummary.lastStatus candidacyStatusSelection)
        |> with Admin.Object.CandidacySummary.createdAt


candidacyGoalSelection : SelectionSet Data.Candidacy.CandidacyGoal Admin.Object.CandidateGoal
candidacyGoalSelection =
    SelectionSet.succeed Data.Candidacy.CandidacyGoal
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.CandidateGoal.goalId)
        |> with Admin.Object.CandidateGoal.additionalInformation


candidacyExperienceSelection : SelectionSet Data.Candidacy.CandidacyExperience Admin.Object.Experience
candidacyExperienceSelection =
    SelectionSet.succeed Data.Candidacy.CandidacyExperience
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Experience.id)
        |> with Admin.Object.Experience.title
        |> with Admin.Object.Experience.startedAt
        |> with Admin.Object.Experience.duration
        |> with Admin.Object.Experience.description


candidacySelection : SelectionSet Data.Candidacy.Candidacy Admin.Object.Candidacy
candidacySelection =
    SelectionSet.succeed Data.Candidacy.Candidacy
        |> with (SelectionSet.map (\(Id id) -> Data.Candidacy.candidacyIdFromString id) Admin.Object.Candidacy.id)
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Candidacy.deviceId)
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Candidacy.certificationId)
        |> with (SelectionSet.map (Maybe.map (\(Id id) -> id)) Admin.Object.Candidacy.companionId)
        |> with (Admin.Object.Candidacy.certification certificationSelection)
        |> with (Admin.Object.Candidacy.goals candidacyGoalSelection)
        |> with (Admin.Object.Candidacy.experiences candidacyExperienceSelection)
        |> with Admin.Object.Candidacy.phone
        |> with Admin.Object.Candidacy.email
        |> with (Admin.Object.Candidacy.candidacyStatuses candidacyStatusSelection)
        |> with Admin.Object.Candidacy.createdAt


requestCandidacies :
    String
    -> (RemoteData String (List Data.Candidacy.CandidacySummary) -> msg)
    -> Cmd msg
requestCandidacies endpointGraphql toMsg =
    Query.getCandidacies candidacySummarySelection
        |> makeQuery endpointGraphql toMsg


requestCandidacy :
    String
    -> (RemoteData String Data.Candidacy.Candidacy -> msg)
    -> CandidacyId
    -> Cmd msg
requestCandidacy endpointGraphql toMsg id =
    let
        candidacyRequiredArgs =
            Query.GetCandidacyByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString id)
    in
    Query.getCandidacyById candidacyRequiredArgs candidacySelection
        |> makeQuery endpointGraphql (nothingToError "Cette candidature est introuvable" >> toMsg)


deleteCandidacy :
    String
    -> (RemoteData String String -> msg)
    -> CandidacyId
    -> Cmd msg
deleteCandidacy endpointGraphql toMsg candidacyId =
    Mutation.CandidacyDeleteByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)
        |> Mutation.candidacy_deleteById
        |> makeMutation endpointGraphql toMsg


archiveCandidacy :
    String
    -> (RemoteData String Data.Candidacy.Candidacy -> msg)
    -> CandidacyId
    -> Cmd msg
archiveCandidacy endpointGraphql toMsg candidacyId =
    Mutation.candidacy_archiveById (Mutation.CandidacyArchiveByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)) candidacySelection
        |> makeMutation endpointGraphql toMsg


takeOverCandidacy :
    String
    -> (RemoteData String Data.Candidacy.Candidacy -> msg)
    -> CandidacyId
    -> Cmd msg
takeOverCandidacy endpointGraphql toMsg candidacyId =
    Mutation.candidacy_takeOver (Mutation.CandidacyTakeOverRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)) candidacySelection
        |> makeMutation endpointGraphql toMsg


requestAppointment :
    String
    -> CandidacyId
    -> (RemoteData String (Dict String String) -> msg)
    -> Cmd msg
requestAppointment endpointGraphql candidacyId toMsg =
    let
        appointmentRequiredArs =
            Query.GetCandidacyByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)
    in
    Query.getCandidacyById appointmentRequiredArs appointmentSelection
        |> makeQuery endpointGraphql (nothingToError "Cette candidature est introuvable" >> toMsg)


updateAppointment :
    String
    -> CandidacyId
    -> (RemoteData String () -> msg)
    -> Dict String String
    -> Cmd msg
updateAppointment endpointGraphql candidacyId toMsg dict =
    let
        appointment =
            Data.Form.Appointment.appointmentFromDict candidacyId dict

        typologyInformationInput =
            Admin.InputObject.CandidateTypologyInformationsInput
                appointment.typology
                (Present appointment.additionalInformation)

        appointmentInformation =
            Admin.InputObject.AppointmentInformationsInput
                appointment.firstAppointmentOccurredAt
                appointment.wasPresentAtFirstAppointment
                appointment.count

        appointmentRequiredArs =
            Mutation.CandidacyUpdateAppointmentInformationsRequiredArguments
                (Id <| Data.Candidacy.candidacyIdToString appointment.candidacyId)
                typologyInformationInput
                appointmentInformation
    in
    Mutation.candidacy_updateAppointmentInformations appointmentRequiredArs SelectionSet.empty
        |> makeMutation endpointGraphql toMsg



-- REFERENTIAL


referentialGoalSelection : SelectionSet Data.Referential.ReferentialGoal Admin.Object.Goal
referentialGoalSelection =
    SelectionSet.succeed Data.Referential.ReferentialGoal
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Goal.id)
        |> with Admin.Object.Goal.label
        |> with Admin.Object.Goal.order
        |> with Admin.Object.Goal.needsAdditionalInformation
        |> with Admin.Object.Goal.isActive


toReferential : List Data.Referential.ReferentialGoal -> Data.Referential.Referential
toReferential goals =
    let
        goalsDict =
            List.map (\g -> ( g.id, g )) goals |> Dict.fromList
    in
    { goals = goalsDict }


referentialSelection : SelectionSet Data.Referential.Referential Admin.Object.Referential
referentialSelection =
    SelectionSet.succeed toReferential
        |> with (Admin.Object.Referential.goals referentialGoalSelection)


requestReferential :
    String
    -> (RemoteData String Data.Referential.Referential -> msg)
    -> Cmd msg
requestReferential endpointGraphql toMsg =
    Query.getReferential referentialSelection
        |> makeQuery endpointGraphql toMsg



--- HELPERS


nothingToError : String -> RemoteData String (Maybe a) -> RemoteData String a
nothingToError failureMessage remoteData =
    case remoteData of
        Success Nothing ->
            Failure failureMessage

        Success (Just candidacy) ->
            Success candidacy

        Failure e ->
            Failure e

        NotAsked ->
            NotAsked

        Loading ->
            Loading
