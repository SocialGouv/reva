module Api.Form.PaymentRequest exposing (confirm, createOrUpdate, get)

import Admin.InputObject
import Admin.Mutation as Mutation
import Admin.Object
import Admin.Object.Candidacy
import Admin.Object.FundingRequestInformations
import Admin.Object.PaymentRequest
import Admin.Query as Query
import Admin.Scalar exposing (Id(..), Timestamp(..), Uuid(..))
import Api.Auth as Auth
import Api.Form.FundingRequestUniReva
import Api.Token exposing (Token)
import Data.Candidacy exposing (CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.PaymentRequest
import Data.Referential
import Dict exposing (Dict)
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet, with)
import RemoteData exposing (RemoteData(..))


createOrUpdate :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> FormData
    -> Cmd msg
createOrUpdate candidacyId endpointGraphql token toMsg ( candidacy, referential ) formData =
    let
        payment =
            Data.Form.PaymentRequest.fromDict formData

        paymentInput =
            Admin.InputObject.PaymentRequestInput
                payment.diagnosisHourCount
                payment.diagnosisCost
                payment.postExamHourCount
                payment.postExamCost
                payment.individualHourCount
                payment.individualCost
                payment.collectiveHourCount
                payment.collectiveCost
                payment.mandatoryTrainingsHourCount
                payment.mandatoryTrainingsCost
                payment.basicSkillsHourCount
                payment.basicSkillsCost
                payment.certificateSkillsHourCount
                payment.certificateSkillsCost
                payment.otherTrainingHourCount
                payment.otherTrainingCost
                payment.examHourCount
                payment.examCost
                payment.invoiceNumber

        paymentRequiredArg =
            Mutation.CandidacyCreateOrUpdatePaymentRequestRequiredArguments
                (Uuid <| Data.Candidacy.candidacyIdToString candidacyId)
                paymentInput
    in
    Mutation.candidacy_createOrUpdatePaymentRequest paymentRequiredArg SelectionSet.empty
        |> Auth.makeMutation "createOrUpdatePaymentRequest" endpointGraphql token toMsg


confirm :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData (List String) () -> msg)
    -> ( Data.Candidacy.Candidacy, Data.Referential.Referential )
    -> FormData
    -> Cmd msg
confirm candidacyId endpointGraphql token toMsg _ _ =
    let
        paymentRequiredArg =
            Mutation.CandidacyConfirmPaymentRequestRequiredArguments
                (Uuid <| Data.Candidacy.candidacyIdToString candidacyId)
    in
    Mutation.candidacy_confirmPaymentRequest paymentRequiredArg SelectionSet.empty
        |> Auth.makeMutation "confirmPaymentRequest" endpointGraphql token toMsg


get :
    CandidacyId
    -> String
    -> Token
    -> (RemoteData (List String) (Dict String String) -> msg)
    -> Cmd msg
get candidacyId endpointGraphql token toMsg =
    let
        fundingInfoRequiredArg =
            Query.CandidateGetFundingRequestRequiredArguments (Uuid <| Data.Candidacy.candidacyIdToString candidacyId)

        paymentInfoRequiredArg =
            Query.GetCandidacyByIdRequiredArguments (Id <| Data.Candidacy.candidacyIdToString candidacyId)

        fundingRequestSelection =
            Admin.Object.FundingRequestInformations.fundingRequest Api.Form.FundingRequestUniReva.selection

        paymentRequestSelection =
            Admin.Object.Candidacy.paymentRequest selection
    in
    SelectionSet.succeed Data.Form.PaymentRequest.maybePaymentRequest
        |> with (Query.candidate_getFundingRequest fundingInfoRequiredArg fundingRequestSelection)
        |> with (Query.getCandidacyById paymentInfoRequiredArg paymentRequestSelection)
        |> Auth.makeQuery "getPaymentRequest" endpointGraphql token toMsg


selection : SelectionSet Data.Form.PaymentRequest.PaymentRequestInput Admin.Object.PaymentRequest
selection =
    SelectionSet.succeed Data.Form.PaymentRequest.PaymentRequestInput
        |> with Admin.Object.PaymentRequest.diagnosisEffectiveHourCount
        |> with Admin.Object.PaymentRequest.diagnosisEffectiveCost
        |> with Admin.Object.PaymentRequest.postExamEffectiveHourCount
        |> with Admin.Object.PaymentRequest.postExamEffectiveCost
        |> with Admin.Object.PaymentRequest.individualEffectiveHourCount
        |> with Admin.Object.PaymentRequest.individualEffectiveCost
        |> with Admin.Object.PaymentRequest.collectiveEffectiveHourCount
        |> with Admin.Object.PaymentRequest.collectiveEffectiveCost
        |> with Admin.Object.PaymentRequest.basicSkillsEffectiveHourCount
        |> with Admin.Object.PaymentRequest.basicSkillsEffectiveCost
        |> with Admin.Object.PaymentRequest.mandatoryTrainingsEffectiveHourCount
        |> with Admin.Object.PaymentRequest.mandatoryTrainingsEffectiveCost
        |> with Admin.Object.PaymentRequest.certificateSkillsEffectiveHourCount
        |> with Admin.Object.PaymentRequest.certificateSkillsEffectiveCost
        |> with Admin.Object.PaymentRequest.otherTrainingEffectiveHourCount
        |> with Admin.Object.PaymentRequest.otherTrainingEffectiveCost
        |> with Admin.Object.PaymentRequest.examEffectiveHourCount
        |> with Admin.Object.PaymentRequest.examEffectiveCost
        |> with Admin.Object.PaymentRequest.invoiceNumber
