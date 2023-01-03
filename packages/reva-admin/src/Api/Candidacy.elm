module Api.Candidacy exposing (archive, delete, dropOut, get, getCandidacies, takeOver)

import Admin.InputObject exposing (DropOutInput)
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.Candidacy
import Admin.Object.CandidacyStatus
import Admin.Object.CandidacySummary
import Admin.Object.Candidate
import Admin.Object.CandidateGoal
import Admin.Object.Certification
import Admin.Object.Department
import Admin.Object.Experience
import Admin.Object.Organism
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.Degree
import Api.RemoteData exposing (nothingToError)
import Api.Token exposing (Token)
import Api.VulnerabilityIndicator
import Data.Candidacy exposing (CandidacyId)
import Data.Candidate
import Data.Certification
import Data.Form.DropOut
import Data.Organism exposing (Organism)
import Data.Referential
import Dict exposing (Dict)
import Graphql.Operation
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


getCandidacies :
    String
    -> Token
    -> (RemoteData String (List Data.Candidacy.CandidacySummary) -> msg)
    -> Cmd msg
getCandidacies endpointGraphql token toMsg =
    Query.getCandidacies summarySelection
        |> Auth.makeQuery endpointGraphql token toMsg


get :
    String
    -> Token
    -> (RemoteData String Data.Candidacy.Candidacy -> msg)
    -> CandidacyId
    -> Cmd msg
get endpointGraphql token toMsg candidacyId =
    let
        id =
            Data.Candidacy.candidacyIdToString candidacyId
    in
    selection id
        |> Auth.makeQuery endpointGraphql token (nothingToError "Cette candidature est introuvable" >> toMsg)


delete :
    String
    -> Token
    -> (RemoteData String String -> msg)
    -> CandidacyId
    -> Cmd msg
delete endpointGraphql token toMsg candidacyId =
    Mutation.CandidacyDeleteByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)
        |> Mutation.candidacy_deleteById
        |> Auth.makeMutation endpointGraphql token toMsg


archive :
    String
    -> Token
    -> (RemoteData String () -> msg)
    -> CandidacyId
    -> Cmd msg
archive endpointGraphql token toMsg candidacyId =
    let
        id =
            Data.Candidacy.candidacyIdToString candidacyId
    in
    Mutation.candidacy_archiveById (Mutation.CandidacyArchiveByIdRequiredArguments (Id id)) (SelectionSet.succeed ())
        |> Auth.makeMutation endpointGraphql token toMsg


takeOver :
    String
    -> Token
    -> (RemoteData String () -> msg)
    -> CandidacyId
    -> Cmd msg
takeOver endpointGraphql token toMsg candidacyId =
    let
        id =
            Data.Candidacy.candidacyIdToString candidacyId
    in
    Mutation.candidacy_takeOver (Mutation.CandidacyTakeOverRequiredArguments (Id id)) (SelectionSet.succeed ())
        |> Auth.makeMutation endpointGraphql token toMsg


dropOut :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData String () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> Dict String String
    -> Cmd msg
dropOut candidacyId endpointGraphql token toMsg ( _, referential ) dict =
    let
        dropOutData =
            Data.Form.DropOut.fromDict referential.dropOutReasons dict

        dropOutReasonContent =
            if dropOutData.otherReasonContent == "" then
                Null

            else
                Present dropOutData.otherReasonContent

        dropOutInput =
            DropOutInput
                dropOutData.droppedOutAt
                (Uuid dropOutData.dropOutReason)
                dropOutReasonContent

        id =
            Data.Candidacy.candidacyIdToString candidacyId
    in
    Mutation.candidacy_dropOut (Mutation.CandidacyDropOutRequiredArguments (Uuid id) dropOutInput) (SelectionSet.succeed ())
        |> Auth.makeMutation endpointGraphql token toMsg


selection : String -> SelectionSet (Maybe Data.Candidacy.Candidacy) Graphql.Operation.RootQuery
selection id =
    let
        candidacyRequiredArgs =
            Query.GetCandidacyByIdRequiredArguments (Id id)

        getCompanionsRequiredArg =
            Query.GetCompanionsForCandidacyRequiredArguments (Uuid id)

        candidacySelectionWithoutCompanions =
            SelectionSet.succeed Data.Candidacy.Candidacy
                |> with (SelectionSet.map (\(Id candidacyId) -> Data.Candidacy.candidacyIdFromString candidacyId) Admin.Object.Candidacy.id)
                |> with (SelectionSet.succeed [])
                |> with (Admin.Object.Candidacy.candidate candidateSelection)
                |> with (SelectionSet.map (Maybe.map (\(Id certificationId) -> certificationId)) Admin.Object.Candidacy.certificationId)
                |> with (Admin.Object.Candidacy.organism organismSelection)
                |> with (Admin.Object.Candidacy.certification certificationSelection)
                |> with (Admin.Object.Candidacy.department departmentSelection)
                |> with (Admin.Object.Candidacy.goals goalSelection)
                |> with (Admin.Object.Candidacy.experiences experienceSelection)
                |> with Admin.Object.Candidacy.firstname
                |> with Admin.Object.Candidacy.lastname
                |> with Admin.Object.Candidacy.phone
                |> with Admin.Object.Candidacy.email
                |> with (Admin.Object.Candidacy.candidacyStatuses statusSelection)
                |> with Admin.Object.Candidacy.createdAt
    in
    SelectionSet.succeed
        (\maybeCandidacy companions ->
            maybeCandidacy
                |> Maybe.map (\candidacy -> { candidacy | availableCompanions = companions })
        )
        |> with (Query.getCandidacyById candidacyRequiredArgs candidacySelectionWithoutCompanions)
        |> with (Query.getCompanionsForCandidacy getCompanionsRequiredArg organismSelection)



-- CANDIDATE


candidateSelection : SelectionSet Data.Candidate.Candidate Admin.Object.Candidate
candidateSelection =
    SelectionSet.succeed Data.Candidate.Candidate
        |> with (SelectionSet.map (\(Uuid id) -> id) Admin.Object.Candidate.id)
        |> with Admin.Object.Candidate.firstname
        |> with Admin.Object.Candidate.firstname2
        |> with Admin.Object.Candidate.firstname3
        |> with Admin.Object.Candidate.gender
        |> with (Admin.Object.Candidate.highestDegree Api.Degree.selection)
        |> with Admin.Object.Candidate.lastname
        |> with (Admin.Object.Candidate.vulnerabilityIndicator Api.VulnerabilityIndicator.selection)



-- CANDIDACY SUMMARY


summarySelection : SelectionSet Data.Candidacy.CandidacySummary Admin.Object.CandidacySummary
summarySelection =
    SelectionSet.succeed Data.Candidacy.CandidacySummary
        |> with (SelectionSet.map (\(Id id) -> Data.Candidacy.candidacyIdFromString id) Admin.Object.CandidacySummary.id)
        |> with (SelectionSet.map (Maybe.map (\(Id id) -> id)) Admin.Object.CandidacySummary.certificationId)
        |> with (Admin.Object.CandidacySummary.certification certificationSelection)
        |> with (Admin.Object.CandidacySummary.department departmentSelection)
        |> with (Admin.Object.CandidacySummary.organism organismSelection)
        |> with Admin.Object.CandidacySummary.firstname
        |> with Admin.Object.CandidacySummary.lastname
        |> with Admin.Object.CandidacySummary.phone
        |> with Admin.Object.CandidacySummary.email
        |> with (Admin.Object.CandidacySummary.lastStatus statusSelection)
        |> with Admin.Object.CandidacySummary.createdAt
        |> with Admin.Object.CandidacySummary.sentAt



-- GOAL


goalSelection : SelectionSet Data.Candidacy.CandidacyGoal Admin.Object.CandidateGoal
goalSelection =
    SelectionSet.succeed Data.Candidacy.CandidacyGoal
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.CandidateGoal.goalId)
        |> with Admin.Object.CandidateGoal.additionalInformation



-- EXPERIENCE


experienceSelection : SelectionSet Data.Candidacy.CandidacyExperience Admin.Object.Experience
experienceSelection =
    SelectionSet.succeed Data.Candidacy.CandidacyExperience
        |> with (SelectionSet.map (\(Id id) -> id) Admin.Object.Experience.id)
        |> with Admin.Object.Experience.title
        |> with Admin.Object.Experience.startedAt
        |> with Admin.Object.Experience.duration
        |> with Admin.Object.Experience.description



-- STATUS


statusSelection : SelectionSet Data.Candidacy.CandidacyStatus Admin.Object.CandidacyStatus
statusSelection =
    SelectionSet.succeed Data.Candidacy.CandidacyStatus
        |> with Admin.Object.CandidacyStatus.createdAt
        |> with Admin.Object.CandidacyStatus.status
        |> with Admin.Object.CandidacyStatus.isActive



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



-- DEPARTMENT


departmentSelection : SelectionSet Data.Referential.Department Admin.Object.Department
departmentSelection =
    SelectionSet.succeed Data.Referential.Department
        |> with Admin.Object.Department.id
        |> with Admin.Object.Department.code
        |> with Admin.Object.Department.label



-- ORGANISM


organismSelection : SelectionSet Data.Organism.Organism Admin.Object.Organism
organismSelection =
    SelectionSet.succeed Data.Organism.Organism
        |> with (SelectionSet.map (\(Uuid id) -> id) Admin.Object.Organism.id)
        |> with Admin.Object.Organism.label
        |> with Admin.Object.Organism.address
        |> with Admin.Object.Organism.zip
        |> with Admin.Object.Organism.city
        |> with Admin.Object.Organism.contactAdministrativeEmail
