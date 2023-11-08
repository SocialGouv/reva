module Data.Form.PaymentRequestUniReva exposing
    ( PaymentRequestInput
    , TrainingForm
    , fromDict
    , keys
    , maybePaymentRequest
    , paymentRequest
    , validate
    , validateConfirmation
    )

import Admin.Scalar exposing (Decimal)
import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.FundingRequestUniReva exposing (FundingRequestInput)
import Data.Form.Helper as Helper
import Data.Referential exposing (Referential)
import Dict exposing (Dict)


type alias TrainingForm =
    { mandatoryTrainingIds : List String
    , basicSkillsIds : List String
    , certificateSkills : String
    , otherTraining : String
    , individualHourCount : Int
    , collectiveHourCount : Int
    }


type alias PaymentRequestInput =
    { diagnosisHourCount : Int
    , diagnosisCost : Decimal
    , postExamHourCount : Int
    , postExamCost : Decimal
    , individualHourCount : Int
    , individualCost : Decimal
    , collectiveHourCount : Int
    , collectiveCost : Decimal
    , basicSkillsHourCount : Int
    , basicSkillsCost : Decimal
    , mandatoryTrainingsHourCount : Int
    , mandatoryTrainingsCost : Decimal
    , certificateSkillsHourCount : Int
    , certificateSkillsCost : Decimal
    , otherTrainingHourCount : Int
    , otherTrainingCost : Decimal
    , examHourCount : Int
    , examCost : Decimal
    , invoiceNumber : String
    }


keys =
    { companionId = "companionId"
    , diagnosisEstimatedHourCount = "diagnosisEstimatedHourCount"
    , diagnosisHourCount = "diagnosisHourCount"
    , diagnosisEstimatedCost = "diagnosisEstimatedCost"
    , diagnosisCost = "diagnosisCost"
    , postExamEstimatedHourCount = "postExamEstimatedHourCount"
    , postExamHourCount = "postExamHourCount"
    , postExamEstimatedCost = "postExamEstimatedCost"
    , postExamCost = "postExamCost"
    , individualEstimatedHourCount = "individualEstimatedHourCount"
    , individualHourCount = "individualHourCount"
    , individualEstimatedCost = "individualEstimatedCost"
    , individualCost = "individualCost"
    , isFormConfirmed = "isFormConfirmed"
    , collectiveEstimatedHourCount = "collectiveEstimatedHourCount"
    , collectiveHourCount = "collectiveHourCount"
    , collectiveEstimatedCost = "collectiveEstimatedCost"
    , collectiveCost = "collectiveCost"
    , basicSkillsIds = "basicSkillsIds"
    , basicSkillsEstimatedHourCount = "basicSkillsEstimatedHourCount"
    , basicSkillsHourCount = "basicSkillsHourCount"
    , basicSkillsEstimatedCost = "basicSkillsEstimatedCost"
    , basicSkillsCost = "basicSkillsCost"
    , mandatoryTrainingIds = "mandatoryTrainingIds"
    , mandatoryTrainingsEstimatedHourCount = "mandatoryTrainingsEstimatedHourCount"
    , mandatoryTrainingsHourCount = "mandatoryTrainingsHourCount"
    , mandatoryTrainingsEstimatedCost = "mandatoryTrainingsEstimatedCost"
    , mandatoryTrainingsCost = "mandatoryTrainingsCost"
    , numAction = "numAction"
    , certificateSkills = "certificateSkills"
    , certificateSkillsEstimatedHourCount = "certificateSkillsEstimatedHourCount"
    , certificateSkillsHourCount = "certificateSkillsHourCount"
    , certificateSkillsEstimatedCost = "certificateSkillsEstimatedCost"
    , certificateSkillsCost = "certificateSkillsCost"
    , otherTraining = "otherTraining"
    , otherTrainingEstimatedHourCount = "otherTrainingEstimatedHourCount"
    , otherTrainingHourCount = "otherTrainingHourCount"
    , otherTrainingEstimatedCost = "otherTrainingEstimatedCost"
    , otherTrainingCost = "otherTrainingCost"
    , totalTrainingHourCount = "totalTrainingHourCount"
    , examEstimatedHourCount = "examEstimatedHourCount"
    , examHourCount = "examHourCount"
    , examEstimatedCost = "examEstimatedCost"
    , examCost = "examCost"
    , invoiceFiles = "invoiceFiles"
    , appointmentFiles = "appointmentFiles"
    , invoiceNumber = "invoiceNumber"
    }


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( _, _ ) formData =
    let
        decode =
            Helper.decode keys formData
    in
    if decode.string .invoiceNumber "" == "" then
        Err [ "Veuillez saisir un numéro de facture" ]

    else
        Ok ()


validateConfirmation : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validateConfirmation ( _, _ ) formData =
    let
        decode =
            Helper.decode keys formData
    in
    if decode.bool .isFormConfirmed False then
        Ok ()

    else
        Err [ "Veuillez confirmer le montant de la demande de paiement avant son envoi définitif" ]


fromDict : FormData -> PaymentRequestInput
fromDict formData =
    let
        decode =
            Helper.decode keys formData
    in
    PaymentRequestInput
        (decode.int .diagnosisHourCount 0)
        (decode.decimal .diagnosisCost (Admin.Scalar.Decimal "0"))
        (decode.int .postExamHourCount 0)
        (decode.decimal .postExamCost (Admin.Scalar.Decimal "0"))
        (decode.int .individualHourCount 0)
        (decode.decimal .individualCost (Admin.Scalar.Decimal "0"))
        (decode.int .collectiveHourCount 0)
        (decode.decimal .collectiveCost (Admin.Scalar.Decimal "0"))
        (decode.int .basicSkillsHourCount 0)
        (decode.decimal .basicSkillsCost (Admin.Scalar.Decimal "0"))
        (decode.int .mandatoryTrainingsHourCount 0)
        (decode.decimal .mandatoryTrainingsCost (Admin.Scalar.Decimal "0"))
        (decode.int .certificateSkillsHourCount 0)
        (decode.decimal .certificateSkillsCost (Admin.Scalar.Decimal "0"))
        (decode.int .otherTrainingHourCount 0)
        (decode.decimal .otherTrainingCost (Admin.Scalar.Decimal "0"))
        (decode.int .examHourCount 0)
        (decode.decimal .examCost (Admin.Scalar.Decimal "0"))
        (decode.string .invoiceNumber "")


fundingList funding =
    let
        string key =
            Just <| key funding

        int key =
            Just <| String.fromInt <| key funding

        decimal key =
            Just <| Helper.decimalToString <| key funding
    in
    [ ( .numAction, funding.numAction )
    , ( .companionId, string (.companionId >> Maybe.withDefault "") )
    , ( .diagnosisEstimatedHourCount, int .diagnosisHourCount )
    , ( .diagnosisEstimatedCost, decimal .diagnosisCost )
    , ( .postExamEstimatedHourCount, int .postExamHourCount )
    , ( .postExamEstimatedCost, decimal .postExamCost )
    , ( .individualEstimatedHourCount, int .individualHourCount )
    , ( .individualEstimatedCost, decimal .individualCost )
    , ( .collectiveEstimatedHourCount, int .collectiveHourCount )
    , ( .collectiveEstimatedCost, decimal .collectiveCost )
    , ( .basicSkillsEstimatedHourCount, int .basicSkillsHourCount )
    , ( .basicSkillsEstimatedCost, decimal .basicSkillsCost )
    , ( .mandatoryTrainingsEstimatedHourCount, int .mandatoryTrainingsHourCount )
    , ( .mandatoryTrainingsEstimatedCost, decimal .mandatoryTrainingsCost )
    , ( .numAction, funding.numAction )
    , ( .certificateSkills, string .certificateSkills )
    , ( .certificateSkillsEstimatedHourCount, int .certificateSkillsHourCount )
    , ( .certificateSkillsEstimatedCost, decimal .certificateSkillsCost )
    , ( .otherTraining, string .otherTraining )
    , ( .otherTrainingEstimatedHourCount, int .otherTrainingHourCount )
    , ( .otherTrainingEstimatedCost, decimal .otherTrainingCost )
    , ( .examEstimatedHourCount, int .examHourCount )
    , ( .examEstimatedCost, decimal .examCost )
    ]
        |> Helper.toKeyedList keys


maybePaymentRequest : Maybe FundingRequestInput -> Maybe (Maybe PaymentRequestInput) -> Dict String String
maybePaymentRequest maybeFunding maybeMaybePayment =
    case ( maybeFunding, maybeMaybePayment ) of
        ( Just funding, Just (Just payment) ) ->
            paymentRequest funding payment

        ( Just funding, Just Nothing ) ->
            defaultPaymentRequest funding

        _ ->
            Dict.empty


paymentRequest : FundingRequestInput -> PaymentRequestInput -> Dict String String
paymentRequest funding payment =
    let
        int key =
            Just <| String.fromInt <| key payment

        decimal key =
            Just <| Helper.decimalToString <| key payment

        string key =
            Just <| key payment

        mandatoryTrainingsChecked =
            Helper.toCheckedList funding.mandatoryTrainingIds

        basicSkillsChecked =
            Helper.toCheckedList funding.basicSkillsIds

        paymentList =
            [ ( .diagnosisHourCount, int .diagnosisHourCount )
            , ( .diagnosisCost, decimal .diagnosisCost )
            , ( .postExamHourCount, int .postExamHourCount )
            , ( .postExamCost, decimal .postExamCost )
            , ( .individualHourCount, int .individualHourCount )
            , ( .individualCost, decimal .individualCost )
            , ( .collectiveHourCount, int .collectiveHourCount )
            , ( .collectiveCost, decimal .collectiveCost )
            , ( .basicSkillsHourCount, int .basicSkillsHourCount )
            , ( .basicSkillsCost, decimal .basicSkillsCost )
            , ( .mandatoryTrainingsHourCount, int .mandatoryTrainingsHourCount )
            , ( .mandatoryTrainingsCost, decimal .mandatoryTrainingsCost )
            , ( .certificateSkillsHourCount, int .certificateSkillsHourCount )
            , ( .certificateSkillsCost, decimal .certificateSkillsCost )
            , ( .otherTrainingHourCount, int .otherTrainingHourCount )
            , ( .otherTrainingCost, decimal .otherTrainingCost )
            , ( .examHourCount, int .examHourCount )
            , ( .examCost, decimal .examCost )
            , ( .invoiceNumber, string .invoiceNumber )
            ]
                |> Helper.toKeyedList keys
    in
    Dict.fromList
        (mandatoryTrainingsChecked
            ++ basicSkillsChecked
            ++ paymentList
            ++ fundingList funding
        )


defaultPaymentRequest : FundingRequestInput -> Dict String String
defaultPaymentRequest funding =
    let
        mandatoryTrainingsChecked =
            Helper.toCheckedList funding.mandatoryTrainingIds

        basicSkillsChecked =
            Helper.toCheckedList funding.basicSkillsIds
    in
    Dict.fromList
        (mandatoryTrainingsChecked
            ++ basicSkillsChecked
            ++ fundingList funding
        )
