module Request exposing
    ( archiveCandidacy
    , deleteCandidacy
    , requestAppointment
    , requestCandidacies
    , requestCandidacy
    , requestReferential
    , requestTrainings
    , takeOverCandidacy
    , updateAppointment
    , updateTrainings
    )

import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.BasicSkill
import Admin.Object.Candidacy
import Admin.Object.CandidacyStatus
import Admin.Object.CandidacySummary
import Admin.Object.CandidateGoal
import Admin.Object.Certification
import Admin.Object.Experience
import Admin.Object.Goal
import Admin.Object.Organism
import Admin.Object.Referential
import Admin.Object.Training
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api exposing (Token)
import Data.Candidacy exposing (CandidacyId)
import Data.Certification
import Data.Form.Appointment
import Data.Form.Training
import Data.Organism exposing (Organism, OrganismId)
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


makeAuthRequest token msg request =
    request
        |> Graphql.Http.withHeader "authorization" ("Bearer " ++ Api.tokenToString token)
        |> Graphql.Http.send (Result.mapError graphqlHttpErrorToString >> toRemote >> msg)


makeQuery :
    String
    -> Token
    -> (RemoteData String decodesTo -> msg)
    -> SelectionSet decodesTo Graphql.Operation.RootQuery
    -> Cmd msg
makeQuery endpointGraphql token msg query =
    query
        |> Graphql.Http.queryRequest endpointGraphql
        |> makeAuthRequest token msg


makeMutation :
    String
    -> Token
    -> (RemoteData String decodesTo -> msg)
    -> SelectionSet decodesTo Graphql.Operation.RootMutation
    -> Cmd msg
makeMutation endpointGraphql token msg query =
    query
        |> Graphql.Http.mutationRequest endpointGraphql
        |> makeAuthRequest token msg


simpleGraphqlHttpErrorToString : Graphql.Http.HttpError -> String
simpleGraphqlHttpErrorToString httpError =
    let
        messageDecoder =
            Json.Decode.field "message" Json.Decode.string

        errorsDecoder =
            Json.Decode.field "errors" (Json.Decode.list messageDecoder)

        defaultErrorMsg code =
            String.concat
                [ "Une erreur inattendue s'est produite (code "
                , code
                , ")"
                ]
    in
    case httpError of
        Graphql.Http.BadUrl url ->
            defaultErrorMsg "021"

        Graphql.Http.Timeout ->
            defaultErrorMsg "042"

        Graphql.Http.NetworkError ->
            "Veuillez vérifier votre connexion internet puis réessayer."

        Graphql.Http.BadStatus metadata body ->
            case Json.Decode.decodeString errorsDecoder body of
                Ok message ->
                    String.join " " message

                Err _ ->
                    defaultErrorMsg <| String.fromInt metadata.statusCode

        Graphql.Http.BadPayload _ ->
            defaultErrorMsg "084"


graphqlHttpErrorToString : Graphql.Http.Error a -> List String
graphqlHttpErrorToString error =
    case error of
        Graphql.Http.HttpError httpError ->
            [ simpleGraphqlHttpErrorToString httpError ]

        Graphql.Http.GraphqlError _ errors ->
            List.map
                (\err -> err.message)
                errors



-- CERTIFICATIONS


certificationSelection : SelectionSet Data.Certification.Certification Admin.Object.Certification
certificationSelection =
    SelectionSet.succeed Data.Certification.Certification
        |> with Admin.Object.Certification.id
        |> with Admin.Object.Certification.label
        |> with Admin.Object.Certification.summary
        |> with Admin.Object.Certification.acronym
        |> with Admin.Object.Certification.level
        |> with Admin.Object.Certification.activities
        |> with Admin.Object.Certification.activityArea
        |> with Admin.Object.Certification.accessibleJobType
        |> with Admin.Object.Certification.abilities


certificationSummarySelection : SelectionSet Data.Certification.CertificationSummary Admin.Object.Certification
certificationSummarySelection =
    SelectionSet.succeed Data.Certification.CertificationSummary
        |> with Admin.Object.Certification.id
        |> with Admin.Object.Certification.label



-- ORGANISM


organismSelection : SelectionSet Data.Organism.Organism Admin.Object.Organism
organismSelection =
    SelectionSet.succeed Data.Organism.Organism
        |> with (SelectionSet.map Data.Organism.organismIdFromUuid Admin.Object.Organism.id)
        |> with Admin.Object.Organism.label
        |> with Admin.Object.Organism.address
        |> with Admin.Object.Organism.zip
        |> with Admin.Object.Organism.city
        |> with Admin.Object.Organism.contactAdministrativeEmail



-- CANDIDACY


candidacyStatusSelection : SelectionSet Data.Candidacy.CandidacyStatus Admin.Object.CandidacyStatus
candidacyStatusSelection =
    SelectionSet.succeed Data.Candidacy.CandidacyStatus
        |> with Admin.Object.CandidacyStatus.createdAt
        |> with Admin.Object.CandidacyStatus.status
        |> with Admin.Object.CandidacyStatus.isActive


candidacySummarySelection : SelectionSet Data.Candidacy.CandidacySummary Admin.Object.CandidacySummary
candidacySummarySelection =
    SelectionSet.succeed Data.Candidacy.CandidacySummary
        |> with (SelectionSet.map (\(Id id) -> Data.Candidacy.candidacyIdFromString id) Admin.Object.CandidacySummary.id)
        |> with (SelectionSet.map (Maybe.map (\(Id id) -> id)) Admin.Object.CandidacySummary.certificationId)
        |> with (Admin.Object.CandidacySummary.certification certificationSelection)
        |> with (Admin.Object.CandidacySummary.organism organismSelection)
        |> with Admin.Object.CandidacySummary.firstname
        |> with Admin.Object.CandidacySummary.lastname
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
        |> with (SelectionSet.map (Maybe.map (\(Id id) -> id)) Admin.Object.Candidacy.certificationId)
        |> with (Admin.Object.Candidacy.organism organismSelection)
        |> with (Admin.Object.Candidacy.certification certificationSelection)
        |> with (Admin.Object.Candidacy.goals candidacyGoalSelection)
        |> with (Admin.Object.Candidacy.experiences candidacyExperienceSelection)
        |> with Admin.Object.Candidacy.firstname
        |> with Admin.Object.Candidacy.lastname
        |> with Admin.Object.Candidacy.phone
        |> with Admin.Object.Candidacy.email
        |> with (Admin.Object.Candidacy.candidacyStatuses candidacyStatusSelection)
        |> with Admin.Object.Candidacy.createdAt


requestCandidacies :
    String
    -> Token
    -> (RemoteData String (List Data.Candidacy.CandidacySummary) -> msg)
    -> Cmd msg
requestCandidacies endpointGraphql token toMsg =
    Query.getCandidacies candidacySummarySelection
        |> makeQuery endpointGraphql token toMsg


requestCandidacy :
    String
    -> Token
    -> (RemoteData String Data.Candidacy.Candidacy -> msg)
    -> CandidacyId
    -> Cmd msg
requestCandidacy endpointGraphql token toMsg id =
    let
        candidacyRequiredArgs =
            Query.GetCandidacyByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString id)
    in
    Query.getCandidacyById candidacyRequiredArgs candidacySelection
        |> makeQuery endpointGraphql token (nothingToError "Cette candidature est introuvable" >> toMsg)


deleteCandidacy :
    String
    -> Token
    -> (RemoteData String String -> msg)
    -> CandidacyId
    -> Cmd msg
deleteCandidacy endpointGraphql token toMsg candidacyId =
    Mutation.CandidacyDeleteByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)
        |> Mutation.candidacy_deleteById
        |> makeMutation endpointGraphql token toMsg


archiveCandidacy :
    String
    -> Token
    -> (RemoteData String Data.Candidacy.Candidacy -> msg)
    -> CandidacyId
    -> Cmd msg
archiveCandidacy endpointGraphql token toMsg candidacyId =
    Mutation.candidacy_archiveById (Mutation.CandidacyArchiveByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)) candidacySelection
        |> makeMutation endpointGraphql token toMsg


takeOverCandidacy :
    String
    -> Token
    -> (RemoteData String Data.Candidacy.Candidacy -> msg)
    -> CandidacyId
    -> Cmd msg
takeOverCandidacy endpointGraphql token toMsg candidacyId =
    Mutation.candidacy_takeOver (Mutation.CandidacyTakeOverRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)) candidacySelection
        |> makeMutation endpointGraphql token toMsg



-- APPOINTMENT


appointmentSelection : SelectionSet (Dict String String) Admin.Object.Candidacy
appointmentSelection =
    SelectionSet.succeed Data.Form.Appointment.appointment
        |> with Admin.Object.Candidacy.typology
        |> with Admin.Object.Candidacy.typologyAdditional
        |> with Admin.Object.Candidacy.firstAppointmentOccuredAt
        |> with Admin.Object.Candidacy.appointmentCount
        |> with Admin.Object.Candidacy.wasPresentAtFirstAppointment


requestAppointment :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData String (Dict String String) -> msg)
    -> Cmd msg
requestAppointment candidacyId endpointGraphql token toMsg =
    let
        appointmentRequiredArs =
            Query.GetCandidacyByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)
    in
    Query.getCandidacyById appointmentRequiredArs appointmentSelection
        |> makeQuery endpointGraphql token (nothingToError "Cette candidature est introuvable" >> toMsg)


updateAppointment :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData String () -> msg)
    -> Data.Referential.Referential
    -> Dict String String
    -> Cmd msg
updateAppointment candidacyId endpointGraphql token toMsg referential dict =
    let
        appointment =
            Data.Form.Appointment.appointmentFromDict candidacyId dict

        typologyInformationInput =
            Admin.InputObject.CandidateTypologyInformationsInput
                appointment.typology
                (Present appointment.additionalInformation)

        appointmentInformation =
            Admin.InputObject.AppointmentInformationsInput
                (Maybe.map Present appointment.firstAppointmentOccurredAt |> Maybe.withDefault Absent)
                appointment.wasPresentAtFirstAppointment
                appointment.appointmentCount

        appointmentRequiredArs =
            Mutation.CandidacyUpdateAppointmentInformationsRequiredArguments
                (Id <| Data.Candidacy.candidacyIdToString appointment.candidacyId)
                typologyInformationInput
                appointmentInformation
    in
    Mutation.candidacy_updateAppointmentInformations appointmentRequiredArs SelectionSet.empty
        |> makeMutation endpointGraphql token toMsg



-- TRAININGS


trainingSelection : SelectionSet (Dict String String) Admin.Object.Candidacy
trainingSelection =
    SelectionSet.succeed Data.Form.Training.training
        |> with Admin.Object.Candidacy.mandatoryTrainingIds
        |> with Admin.Object.Candidacy.basicSkillIds
        |> with Admin.Object.Candidacy.certificateSkills
        |> with Admin.Object.Candidacy.validatedByCandidate
        |> with Admin.Object.Candidacy.otherTraining
        |> with Admin.Object.Candidacy.individualHourCount
        |> with Admin.Object.Candidacy.collectiveHourCount
        |> with Admin.Object.Candidacy.additionalHourCount


requestTrainings :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData String (Dict String String) -> msg)
    -> Cmd msg
requestTrainings candidacyId endpointGraphql token toMsg =
    let
        trainingRequiredArs =
            Query.GetCandidacyByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)
    in
    Query.getCandidacyById trainingRequiredArs trainingSelection
        |> makeQuery endpointGraphql token (nothingToError "Cette candidature est introuvable" >> toMsg)


updateTrainings :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData String () -> msg)
    -> Data.Referential.Referential
    -> Dict String String
    -> Cmd msg
updateTrainings candidacyId endpointGraphql token toMsg referential dict =
    let
        training =
            Data.Form.Training.fromDict referential.basicSkills referential.mandatoryTrainings dict

        trainingInformation =
            Admin.InputObject.TrainingInput
                training.certificateSkills
                training.otherTraining
                training.individualHourCount
                training.collectiveHourCount
                training.additionalHourCount
                True
                (List.map Uuid training.basicSkillsIds)
                (List.map Uuid training.mandatoryTrainingIds)

        trainingRequiredArgs =
            Mutation.CandidacySubmitTrainingFormRequiredArguments
                (Uuid <| Data.Candidacy.candidacyIdToString candidacyId)
                trainingInformation
    in
    Mutation.candidacy_submitTrainingForm trainingRequiredArgs SelectionSet.empty
        |> makeMutation endpointGraphql token toMsg



-- REFERENTIAL


basicSkillSelection : SelectionSet Data.Referential.BasicSkill Admin.Object.BasicSkill
basicSkillSelection =
    SelectionSet.succeed Data.Referential.BasicSkill
        |> with (SelectionSet.map (\(Uuid id) -> id) Admin.Object.BasicSkill.id)
        |> with Admin.Object.BasicSkill.label


referentialGoalSelection : SelectionSet Data.Referential.ReferentialGoal Admin.Object.Goal
referentialGoalSelection =
    SelectionSet.succeed Data.Referential.ReferentialGoal
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Goal.id)
        |> with Admin.Object.Goal.label
        |> with Admin.Object.Goal.order
        |> with Admin.Object.Goal.needsAdditionalInformation
        |> with Admin.Object.Goal.isActive


trainingsSelection : SelectionSet Data.Referential.MandatoryTraining Admin.Object.Training
trainingsSelection =
    SelectionSet.succeed Data.Referential.MandatoryTraining
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Training.id)
        |> with Admin.Object.Training.label


toGoals : List Data.Referential.ReferentialGoal -> Data.Referential.ReferentialGoals
toGoals goals =
    let
        goalsDict =
            List.map (\g -> ( g.id, g )) goals |> Dict.fromList
    in
    { goals = goalsDict }


goalsSelection : SelectionSet Data.Referential.ReferentialGoals Admin.Object.Referential
goalsSelection =
    SelectionSet.succeed toGoals
        |> with (Admin.Object.Referential.goals referentialGoalSelection)


referentialSelection : SelectionSet Data.Referential.Referential Graphql.Operation.RootQuery
referentialSelection =
    SelectionSet.succeed
        (\basicSkills referentialGoals trainings ->
            Data.Referential.Referential basicSkills referentialGoals.goals trainings
        )
        |> with (Query.getBasicSkills basicSkillSelection)
        |> with (Query.getReferential goalsSelection)
        |> with (Query.getTrainings trainingsSelection)


requestReferential :
    String
    -> Token
    -> (RemoteData String Data.Referential.Referential -> msg)
    -> Cmd msg
requestReferential endpointGraphql token toMsg =
    makeQuery endpointGraphql token toMsg referentialSelection



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
