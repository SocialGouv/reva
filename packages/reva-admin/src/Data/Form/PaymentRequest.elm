module Data.Form.PaymentRequest exposing
    ( PaymentRequestInput
    , TrainingForm
    , fromDict
    , keys
    , maybePaymentRequest
    , paymentRequest
    , validate
    )

import Data.Candidacy exposing (Candidacy)
import Data.Form.FundingRequest exposing (FundingRequestInput)
import Data.Form.Helper as Helper
import Data.Referential exposing (BasicSkill, MandatoryTraining, Referential)
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
    , postExamHourCount : Int
    , individualHourCount : Int
    , collectiveHourCount : Int
    , basicSkillsHourCount : Int
    , mandatoryTrainingsHourCount : Int
    , certificateSkillsHourCount : Int
    , examHourCount : Int
    }


keys =
    { companionId = "companionId"
    , diagnosisEstimatedHourCount = "diagnosisEstimatedHourCount"
    , diagnosisHourCount = "diagnosisHourCount"
    , diagnosisCost = "diagnosisCost"
    , postExamEstimatedHourCount = "postExamEstimatedHourCount"
    , postExamHourCount = "postExamHourCount"
    , postExamCost = "postExamCost"
    , individualEstimatedHourCount = "individualEstimatedHourCount"
    , individualHourCount = "individualHourCount"
    , individualCost = "individualCost"
    , isFormConfirmed = "isFormConfirmed"
    , collectiveEstimatedHourCount = "collectiveEstimatedHourCount"
    , collectiveHourCount = "collectiveHourCount"
    , collectiveCost = "collectiveCost"
    , basicSkillsIds = "basicSkillsIds"
    , basicSkillsEstimatedHourCount = "basicSkillsEstimatedHourCount"
    , basicSkillsHourCount = "basicSkillsHourCount"
    , basicSkillsCost = "basicSkillsCost"
    , mandatoryTrainingIds = "mandatoryTrainingIds"
    , mandatoryTrainingsEstimatedHourCount = "mandatoryTrainingsEstimatedHourCount"
    , mandatoryTrainingsHourCount = "mandatoryTrainingsHourCount"
    , mandatoryTrainingsCost = "mandatoryTrainingsCost"
    , numAction = "numAction"
    , certificateSkills = "certificateSkills"
    , certificateSkillsEstimatedHourCount = "certificateSkillsEstimatedHourCount"
    , certificateSkillsHourCount = "certificateSkillsHourCount"
    , certificateSkillsCost = "certificateSkillsCost"
    , otherTraining = "otherTraining"
    , totalTrainingHourCount = "totalTrainingHourCount"
    , examEstimatedHourCount = "examEstimatedHourCount"
    , examHourCount = "examHourCount"
    , examCost = "examCost"
    }


validate : ( Candidacy, Referential ) -> Dict String String -> Result String ()
validate ( candidacy, _ ) dict =
    let
        decode =
            Helper.decode keys dict

        companionValidation () =
            case ( candidacy.dropOutDate, decode.maybe.string .companionId ) of
                ( Nothing, Nothing ) ->
                    Err "Veuillez sélectionner un accompagnateur"

                _ ->
                    Ok ()

        confirmationValidation () =
            if decode.bool .isFormConfirmed False then
                Ok ()

            else
                Err "Veuillez confirmer le montant de la prise en charge avant son envoi définitif"
    in
    companionValidation ()
        |> Result.andThen confirmationValidation


fromDict : Dict String String -> PaymentRequestInput
fromDict dict =
    let
        decode =
            Helper.decode keys dict
    in
    PaymentRequestInput
        (decode.int .diagnosisHourCount 0)
        (decode.int .postExamHourCount 0)
        (decode.int .individualHourCount 0)
        (decode.int .collectiveHourCount 0)
        (decode.int .basicSkillsHourCount 0)
        (decode.int .mandatoryTrainingsHourCount 0)
        (decode.int .certificateSkillsHourCount 0)
        (decode.int .examHourCount 0)


fundingList funding =
    let
        string key =
            Just <| key funding

        int key =
            Just <| String.fromInt <| key funding
    in
    [ ( .companionId, string (.companionId >> Maybe.withDefault "") )
    , ( .diagnosisEstimatedHourCount, int .diagnosisHourCount )
    , ( .diagnosisCost, int .diagnosisCost )
    , ( .postExamEstimatedHourCount, int .postExamHourCount )
    , ( .postExamCost, int .postExamCost )
    , ( .individualEstimatedHourCount, int .individualHourCount )
    , ( .individualCost, int .individualCost )
    , ( .collectiveEstimatedHourCount, int .collectiveHourCount )
    , ( .collectiveCost, int .collectiveCost )
    , ( .basicSkillsEstimatedHourCount, int .basicSkillsHourCount )
    , ( .basicSkillsCost, int .basicSkillsCost )
    , ( .mandatoryTrainingsEstimatedHourCount, int .mandatoryTrainingsHourCount )
    , ( .mandatoryTrainingsCost, int .mandatoryTrainingsCost )
    , ( .numAction, funding.numAction )
    , ( .certificateSkills, string .certificateSkills )
    , ( .certificateSkillsEstimatedHourCount, int .certificateSkillsHourCount )
    , ( .certificateSkillsCost, int .certificateSkillsCost )
    , ( .otherTraining, string .otherTraining )
    , ( .examEstimatedHourCount, int .examHourCount )
    , ( .examCost, int .examCost )
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

        mandatoryTrainingsChecked =
            Helper.toCheckedList funding.mandatoryTrainingIds

        basicSkillsChecked =
            Helper.toCheckedList funding.basicSkillsIds

        paymentList =
            [ ( .diagnosisHourCount, int .diagnosisHourCount )
            , ( .postExamHourCount, int .postExamHourCount )
            , ( .individualHourCount, int .individualHourCount )
            , ( .collectiveHourCount, int .collectiveHourCount )
            , ( .basicSkillsHourCount, int .basicSkillsHourCount )
            , ( .mandatoryTrainingsHourCount, int .mandatoryTrainingsHourCount )
            , ( .certificateSkillsHourCount, int .certificateSkillsHourCount )
            , ( .examHourCount, int .examHourCount )
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
