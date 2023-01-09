module Api.Form.FundingRequest exposing (create, get, selection)

import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.BasicSkill
import Admin.Object.FundingRequest
import Admin.Object.FundingRequestInformations
import Admin.Object.Organism
import Admin.Object.Training
import Admin.Object.TrainingForm
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.Token exposing (Token)
import Data.Candidacy exposing (Candidacy, CandidacyId)
import Data.Form.FundingRequest
import Data.Referential
import Dict exposing (Dict)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


create :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData String () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> Dict String String
    -> Cmd msg
create candidacyId endpointGraphql token toMsg ( candidacy, referential ) dict =
    let
        funding =
            Data.Form.FundingRequest.fromDict referential.basicSkills referential.mandatoryTrainings dict

        fundingInput =
            Admin.InputObject.FundingRequestInput
                -- (
                (Maybe.map
                    (Uuid >> Present)
                    funding.companionId
                    |> Maybe.withDefault Absent
                )
                funding.diagnosisHourCount
                funding.diagnosisCost
                funding.postExamHourCount
                funding.postExamCost
                funding.individualHourCount
                funding.individualCost
                funding.collectiveHourCount
                funding.collectiveCost
                (List.map Uuid funding.basicSkillsIds)
                funding.basicSkillsHourCount
                funding.basicSkillsCost
                (List.map Uuid funding.mandatoryTrainingIds)
                funding.mandatoryTrainingsHourCount
                funding.mandatoryTrainingsCost
                funding.certificateSkills
                funding.certificateSkillsHourCount
                funding.certificateSkillsCost
                funding.otherTraining
                funding.examHourCount
                funding.examCost

        fundingRequiredArg =
            Mutation.CandidateCreateFundingRequestRequiredArguments
                (Uuid <| Data.Candidacy.candidacyIdToString candidacyId)
                fundingInput
    in
    Mutation.candidate_createFundingRequest fundingRequiredArg SelectionSet.empty
        |> Auth.makeMutation endpointGraphql token toMsg


get :
    CandidacyId
    -> Candidacy
    -> String
    -> Token
    -> (RemoteData String (Dict String String) -> msg)
    -> Cmd msg
get candidacyId candidacy endpointGraphql token toMsg =
    let
        fundingInfoRequiredArg =
            Query.CandidateGetFundingRequestRequiredArguments (Uuid <| Data.Candidacy.candidacyIdToString candidacyId)

        trainingFormSelection =
            if candidacy.dropOutDate == Nothing then
                SelectionSet.succeed Data.Form.FundingRequest.TrainingForm
                    |> with
                        (Admin.Object.TrainingForm.mandatoryTrainings
                            (SelectionSet.succeed (\(Id id) -> id) |> with Admin.Object.Training.id)
                        )
                    |> with
                        (Admin.Object.TrainingForm.basicSkills
                            (SelectionSet.succeed (\(Uuid id) -> id) |> with Admin.Object.BasicSkill.id)
                        )
                    |> with Admin.Object.TrainingForm.certificateSkills
                    |> with Admin.Object.TrainingForm.otherTraining
                    |> with Admin.Object.TrainingForm.individualHourCount
                    |> with Admin.Object.TrainingForm.collectiveHourCount

            else
                SelectionSet.succeed
                    { mandatoryTrainingIds = []
                    , basicSkillsIds = []
                    , certificateSkills = ""
                    , otherTraining = ""
                    , individualHourCount = 0
                    , collectiveHourCount = 0
                    }
    in
    SelectionSet.succeed Data.Form.FundingRequest.fundingRequestInformations
        |> with (Admin.Object.FundingRequestInformations.fundingRequest selection)
        |> with (Admin.Object.FundingRequestInformations.training trainingFormSelection)
        |> Query.candidate_getFundingRequest fundingInfoRequiredArg
        |> Auth.makeQuery endpointGraphql token toMsg


selection : SelectionSet Data.Form.FundingRequest.FundingRequestInput Admin.Object.FundingRequest
selection =
    SelectionSet.succeed Data.Form.FundingRequest.FundingRequestInput
        |> with
            (Admin.Object.FundingRequest.companion
                (SelectionSet.succeed (\(Uuid id) -> id) |> with Admin.Object.Organism.id)
            )
        |> with Admin.Object.FundingRequest.diagnosisHourCount
        |> with Admin.Object.FundingRequest.diagnosisCost
        |> with Admin.Object.FundingRequest.postExamHourCount
        |> with Admin.Object.FundingRequest.postExamCost
        |> with Admin.Object.FundingRequest.individualHourCount
        |> with Admin.Object.FundingRequest.individualCost
        |> with Admin.Object.FundingRequest.collectiveHourCount
        |> with Admin.Object.FundingRequest.collectiveCost
        |> with
            (Admin.Object.FundingRequest.basicSkills
                (SelectionSet.succeed (\(Uuid id) -> id) |> with Admin.Object.BasicSkill.id)
            )
        |> with Admin.Object.FundingRequest.basicSkillsHourCount
        |> with Admin.Object.FundingRequest.basicSkillsCost
        |> with
            (Admin.Object.FundingRequest.mandatoryTrainings
                (SelectionSet.succeed (\(Id id) -> id) |> with Admin.Object.Training.id)
            )
        |> with Admin.Object.FundingRequest.mandatoryTrainingsHourCount
        |> with Admin.Object.FundingRequest.mandatoryTrainingsCost
        |> with Admin.Object.FundingRequest.numAction
        |> with Admin.Object.FundingRequest.certificateSkills
        |> with Admin.Object.FundingRequest.certificateSkillsHourCount
        |> with Admin.Object.FundingRequest.certificateSkillsCost
        |> with Admin.Object.FundingRequest.otherTraining
        |> with Admin.Object.FundingRequest.examHourCount
        |> with Admin.Object.FundingRequest.examCost
