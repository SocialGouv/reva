module Api.Form.FundingRequestUniFvae exposing (create, get)

import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.FundingRequestUnifvae
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
            Data.Form.FundingRequestUniFvae.fromDict formData

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
        fundingInfoRequiredArg =
            Query.CandidacyGetFundingRequestUnifvaeRequiredArguments (Uuid <| Data.Candidacy.candidacyIdToString candidacyId)
    in
    SelectionSet.succeed Data.Form.FundingRequestUniFvae.maybeFundingRequest
        |> with (Query.candidacy_getFundingRequestUnifvae fundingInfoRequiredArg selection)
        |> Auth.makeQuery "getFundingRequestUnifvae" endpointGraphql token toMsg


selection : SelectionSet Data.Form.FundingRequestUniFvae.FundingRequestInput Admin.Object.FundingRequestUnifvae
selection =
    SelectionSet.succeed Data.Form.FundingRequestUniFvae.FundingRequestInput
        |> with Admin.Object.FundingRequestUnifvae.candidateSecondname
        |> with Admin.Object.FundingRequestUnifvae.candidateThirdname
        |> with Admin.Object.FundingRequestUnifvae.candidateGender
        |> with Admin.Object.FundingRequestUnifvae.individualHourCount
        |> with Admin.Object.FundingRequestUnifvae.individualCost
        |> with Admin.Object.FundingRequestUnifvae.collectiveHourCount
        |> with Admin.Object.FundingRequestUnifvae.collectiveCost
        |> with Admin.Object.FundingRequestUnifvae.basicSkillsHourCount
        |> with Admin.Object.FundingRequestUnifvae.basicSkillsCost
        |> with Admin.Object.FundingRequestUnifvae.mandatoryTrainingsHourCount
        |> with Admin.Object.FundingRequestUnifvae.mandatoryTrainingsCost
        |> with Admin.Object.FundingRequestUnifvae.certificateSkillsHourCount
        |> with Admin.Object.FundingRequestUnifvae.certificateSkillsCost
        |> with Admin.Object.FundingRequestUnifvae.otherTrainingHourCount
        |> with Admin.Object.FundingRequestUnifvae.otherTrainingCost
