module Api.Form.FundingRequestUniFvae exposing (create, get)

import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.BasicSkill
import Admin.Object.Candidacy
import Admin.Object.FundingRequestUnifvae
import Admin.Object.Training
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.Token exposing (Token)
import Data.Candidacy exposing (CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.FundingRequestUniFvae
import Data.Referential
import Dict exposing (Dict)
import Graphql.OptionalArgument as OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


create :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> FormData
    -> Cmd msg
create candidacyId endpointGraphql token toMsg ( candidacy, referential ) formData =
    let
        funding =
            Data.Form.FundingRequestUniFvae.fromDict referential.basicSkills referential.mandatoryTrainings formData

        fundingInput =
            Admin.InputObject.FundingRequestUnifvaeInput
                (OptionalArgument.fromMaybe funding.candidateSecondname)
                (OptionalArgument.fromMaybe funding.candidateThirdname)
                funding.candidateGender
                funding.individualHourCount
                funding.individualCost
                funding.collectiveHourCount
                funding.collectiveCost
                funding.basicSkillsHourCount
                funding.basicSkillsCost
                funding.mandatoryTrainingsHourCount
                funding.mandatoryTrainingsCost
                funding.certificateSkillsHourCount
                funding.certificateSkillsCost
                funding.otherTrainingHourCount
                funding.otherTrainingCost

        fundingRequiredArg =
            Mutation.CandidacyCreateFundingRequestUnifvaeRequiredArguments
                (Uuid <| Data.Candidacy.candidacyIdToString candidacyId)
                fundingInput
    in
    Mutation.candidacy_createFundingRequestUnifvae fundingRequiredArg SelectionSet.empty
        |> Auth.makeMutation "createFundingRequestUnifvae" endpointGraphql token toMsg


get :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData (List String) (Dict String String) -> msg)
    -> Cmd msg
get candidacyId endpointGraphql token toMsg =
    let
        getCandidacyByIdRequiredArguments =
            Query.GetCandidacyByIdRequiredArguments (Id (Data.Candidacy.candidacyIdToString candidacyId))

        fundingRequestFromCandidacySelection =
            Admin.Object.Candidacy.fundingRequestUnifvae fundingRequestSelection

        basicSkillIdsFromCandidacySelection =
            Admin.Object.Candidacy.basicSkillIds

        mandatoryTrainingIdsFromCandidacySelection =
            Admin.Object.Candidacy.mandatoryTrainingIds
    in
    SelectionSet.succeed Data.Form.FundingRequestUniFvae.maybeFundingRequest
        |> with fundingRequestFromCandidacySelection
        |> with basicSkillIdsFromCandidacySelection
        |> with mandatoryTrainingIdsFromCandidacySelection
        |> Query.getCandidacyById getCandidacyByIdRequiredArguments
        |> SelectionSet.nonNullOrFail
        |> Auth.makeQuery "getCandidacyById" endpointGraphql token toMsg


fundingRequestSelection : SelectionSet Data.Form.FundingRequestUniFvae.FundingRequest Admin.Object.FundingRequestUnifvae
fundingRequestSelection =
    SelectionSet.succeed Data.Form.FundingRequestUniFvae.FundingRequest
        |> with Admin.Object.FundingRequestUnifvae.candidateSecondname
        |> with Admin.Object.FundingRequestUnifvae.candidateThirdname
        |> with Admin.Object.FundingRequestUnifvae.candidateGender
        |> with Admin.Object.FundingRequestUnifvae.individualHourCount
        |> with Admin.Object.FundingRequestUnifvae.individualCost
        |> with Admin.Object.FundingRequestUnifvae.collectiveHourCount
        |> with Admin.Object.FundingRequestUnifvae.collectiveCost
        |> with
            (Admin.Object.FundingRequestUnifvae.basicSkills
                (SelectionSet.succeed (\(Uuid id) -> id) |> with Admin.Object.BasicSkill.id)
            )
        |> with Admin.Object.FundingRequestUnifvae.basicSkillsHourCount
        |> with Admin.Object.FundingRequestUnifvae.basicSkillsCost
        |> with
            (Admin.Object.FundingRequestUnifvae.mandatoryTrainings
                (SelectionSet.succeed (\(Id id) -> id) |> with Admin.Object.Training.id)
            )
        |> with Admin.Object.FundingRequestUnifvae.mandatoryTrainingsHourCount
        |> with Admin.Object.FundingRequestUnifvae.mandatoryTrainingsCost
        |> with Admin.Object.FundingRequestUnifvae.certificateSkillsHourCount
        |> with Admin.Object.FundingRequestUnifvae.certificateSkillsCost
        |> with Admin.Object.FundingRequestUnifvae.otherTrainingHourCount
        |> with Admin.Object.FundingRequestUnifvae.otherTrainingCost
