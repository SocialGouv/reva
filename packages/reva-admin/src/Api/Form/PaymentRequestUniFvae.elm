module Api.Form.PaymentRequestUniFvae exposing (createOrUpdate, get)

import Admin.Object
import Admin.Object.Candidacy
import Admin.Object.FundingRequestUnifvae
import Admin.Object.PaymentRequestUnifvae
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.Token exposing (Token)
import Data.Candidacy exposing (CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.PaymentRequestUniFvae
import Data.Referential
import Dict exposing (Dict)
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


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

        paymentRequestFromCandidacySelection =
            Admin.Object.Candidacy.paymentRequestUnifvae paymentRequestSelection

        fundingRequestFromCandidacySelection =
            Admin.Object.Candidacy.fundingRequestUnifvae fundingRequestSelection

        basicSkillIdsFromCandidacySelection =
            Admin.Object.Candidacy.basicSkillIds

        mandatoryTrainingIdsFromCandidacySelection =
            Admin.Object.Candidacy.mandatoryTrainingIds

        certificateSkillsFromCandidacySelection =
            Admin.Object.Candidacy.certificateSkills

        otherTrainingFromCandidacySelection =
            Admin.Object.Candidacy.otherTraining
    in
    SelectionSet.succeed Data.Form.PaymentRequestUniFvae.maybePaymentRequestFormDict
        |> with paymentRequestFromCandidacySelection
        |> with fundingRequestFromCandidacySelection
        |> with basicSkillIdsFromCandidacySelection
        |> with mandatoryTrainingIdsFromCandidacySelection
        |> with certificateSkillsFromCandidacySelection
        |> with otherTrainingFromCandidacySelection
        |> Query.getCandidacyById getCandidacyByIdRequiredArguments
        |> SelectionSet.nonNullOrFail
        |> Auth.makeQuery "getCandidacyById" endpointGraphql token toMsg


paymentRequestSelection : SelectionSet Data.Form.PaymentRequestUniFvae.PaymentRequest Admin.Object.PaymentRequestUnifvae
paymentRequestSelection =
    SelectionSet.succeed Data.Form.PaymentRequestUniFvae.PaymentRequest
        |> with Admin.Object.PaymentRequestUnifvae.individualEffectiveHourCount
        |> with Admin.Object.PaymentRequestUnifvae.individualEffectiveCost
        |> with Admin.Object.PaymentRequestUnifvae.collectiveEffectiveHourCount
        |> with Admin.Object.PaymentRequestUnifvae.collectiveEffectiveCost
        |> with Admin.Object.PaymentRequestUnifvae.basicSkillsEffectiveHourCount
        |> with Admin.Object.PaymentRequestUnifvae.basicSkillsEffectiveCost
        |> with Admin.Object.PaymentRequestUnifvae.mandatoryTrainingsEffectiveHourCount
        |> with Admin.Object.PaymentRequestUnifvae.mandatoryTrainingsEffectiveCost
        |> with Admin.Object.PaymentRequestUnifvae.certificateSkillsEffectiveHourCount
        |> with Admin.Object.PaymentRequestUnifvae.certificateSkillsEffectiveCost
        |> with Admin.Object.PaymentRequestUnifvae.otherTrainingEffectiveHourCount
        |> with Admin.Object.PaymentRequestUnifvae.otherTrainingEffectiveCost


fundingRequestSelection : SelectionSet Data.Form.PaymentRequestUniFvae.FundingRequest Admin.Object.FundingRequestUnifvae
fundingRequestSelection =
    SelectionSet.succeed Data.Form.PaymentRequestUniFvae.FundingRequest
        |> with Admin.Object.FundingRequestUnifvae.numAction


createOrUpdate :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> FormData
    -> Cmd msg
createOrUpdate candidacyId endpointGraphql token toMsg ( candidacy, referential ) formData =
    Cmd.none
