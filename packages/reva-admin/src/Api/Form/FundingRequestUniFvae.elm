module Api.Form.FundingRequestUniFvae exposing (create, get)

import Admin.Enum.Gender
import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.Token exposing (Token)
import Data.Candidacy exposing (Candidacy, CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.FundingRequestUniFvae
import Data.Referential
import Dict exposing (Dict)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet
import RemoteData exposing (RemoteData(..))
import Graphql.OptionalArgument as OptionalArgument


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
                ""
                (OptionalArgument.fromMaybe funding.candidateSecondname)
                (OptionalArgument.fromMaybe funding.candidateThirdname)
                ""
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

        m =
            Mutation.candidacy_createFundingRequestUnifvae fundingRequiredArg SelectionSet.empty
    in
    Mutation.candidacy_createFundingRequestUnifvae fundingRequiredArg SelectionSet.empty
        |> Auth.makeMutation "createFundingRequestUnifvae" endpointGraphql token toMsg


get :
    CandidacyId
    -> Candidacy
    -> String
    -> Token
    -> (RemoteData (List String) (Dict String String) -> msg)
    -> Cmd msg
get candidacyId candidacy endpointGraphql token toMsg =
    Cmd.none
