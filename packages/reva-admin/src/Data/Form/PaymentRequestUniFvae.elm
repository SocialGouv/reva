module Data.Form.PaymentRequestUniFvae exposing
    ( FundingRequest
    , PaymentRequest
    , fromDict
    , keys
    , maybePaymentRequestFormDict
    , validate
    )

import Admin.Enum.Gender exposing (Gender(..))
import Admin.Scalar exposing (Decimal)
import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (Referential)
import Data.Scalar exposing (Uuid)
import Dict exposing (Dict)


keys =
    { individualHourCount = "individualHourCount"
    , individualCost = "individualCost"
    , collectiveHourCount = "collectiveHourCount"
    , collectiveCost = "collectiveCost"
    , mandatoryTrainingIds = "mandatoryTrainingIds"
    , mandatoryTrainingsHourCount = "mandatoryTrainingsHourCount"
    , mandatoryTrainingsCost = "mandatoryTrainingsCost"
    , basicSkillsIds = "basicSkillsIds"
    , basicSkillsHourCount = "basicSkillsHourCount"
    , basicSkillsCost = "basicSkillsCost"
    , certificateSkills = "certificateSkills"
    , certificateSkillsHourCount = "certificateSkillsHourCount"
    , certificateSkillsCost = "certificateSkillsCost"
    , otherTraining = "otherTraining"
    , otherTrainingHourCount = "otherTrainingHourCount"
    , otherTrainingCost = "otherTrainingCost"
    , numAction = "numAction"
    }


type alias PaymentRequest =
    { individualHourCount : Decimal
    , individualCost : Decimal
    , collectiveHourCount : Decimal
    , collectiveCost : Decimal
    , basicSkillsHourCount : Decimal
    , basicSkillsCost : Decimal
    , mandatoryTrainingsHourCount : Decimal
    , mandatoryTrainingsCost : Decimal
    , certificateSkillsHourCount : Decimal
    , certificateSkillsCost : Decimal
    , otherTrainingHourCount : Decimal
    , otherTrainingCost : Decimal
    }


type alias FundingRequest =
    { numAction : String
    }


fromDict : FormData -> PaymentRequest
fromDict formData =
    let
        decode =
            Helper.decode keys formData
    in
    PaymentRequest
        (decode.decimal .individualHourCount (Admin.Scalar.Decimal "0"))
        (decode.decimal .individualCost (Admin.Scalar.Decimal "0"))
        (decode.decimal .collectiveHourCount (Admin.Scalar.Decimal "0"))
        (decode.decimal .collectiveCost (Admin.Scalar.Decimal "0"))
        (decode.decimal .basicSkillsHourCount (Admin.Scalar.Decimal "0"))
        (decode.decimal .basicSkillsCost (Admin.Scalar.Decimal "0"))
        (decode.decimal .mandatoryTrainingsHourCount (Admin.Scalar.Decimal "0"))
        (decode.decimal .mandatoryTrainingsCost (Admin.Scalar.Decimal "0"))
        (decode.decimal .certificateSkillsHourCount (Admin.Scalar.Decimal "0"))
        (decode.decimal .certificateSkillsCost (Admin.Scalar.Decimal "0"))
        (decode.decimal .otherTrainingHourCount (Admin.Scalar.Decimal "0"))
        (decode.decimal .otherTrainingCost (Admin.Scalar.Decimal "0"))


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( candidacy, _ ) _ =
    Result.Ok ()


toDict : PaymentRequest -> Maybe FundingRequest -> List Uuid -> List Uuid -> Maybe String -> Maybe String -> Dict String String
toDict paymentRequest fundingRequest basicSkillIds mandatoryTrainingIds certificateSkills otherTraining =
    let
        decimal key =
            Just <| Helper.decimalToString <| key paymentRequest

        mandatoryTrainingsChecked =
            Helper.uuidToCheckedList mandatoryTrainingIds

        basicSkillsChecked =
            Helper.uuidToCheckedList basicSkillIds

        fundingList =
            [ ( .individualHourCount, decimal .individualHourCount )
            , ( .individualCost, decimal .individualCost )
            , ( .collectiveHourCount, decimal .collectiveHourCount )
            , ( .collectiveCost, decimal .collectiveCost )
            , ( .basicSkillsHourCount, decimal .basicSkillsHourCount )
            , ( .basicSkillsCost, decimal .basicSkillsCost )
            , ( .mandatoryTrainingsHourCount, decimal .mandatoryTrainingsHourCount )
            , ( .mandatoryTrainingsCost, decimal .mandatoryTrainingsCost )
            , ( .certificateSkills, certificateSkills )
            , ( .certificateSkillsHourCount, decimal .certificateSkillsHourCount )
            , ( .certificateSkillsCost, decimal .certificateSkillsCost )
            , ( .otherTraining, otherTraining )
            , ( .otherTrainingHourCount, decimal .otherTrainingHourCount )
            , ( .otherTrainingCost, decimal .otherTrainingCost )
            , ( .numAction
              , Maybe.map .numAction fundingRequest
              )
            ]
                |> Helper.toKeyedList keys
    in
    Dict.fromList (mandatoryTrainingsChecked ++ basicSkillsChecked ++ fundingList)


defaultPaymentRequestFormDict : Maybe FundingRequest -> List Uuid -> List Uuid -> Maybe String -> Maybe String -> Dict String String
defaultPaymentRequestFormDict fr basicSkillIds mandatoryTrainingIds certificateSkills otherTraining =
    let
        mandatoryTrainingsChecked =
            Helper.uuidToCheckedList mandatoryTrainingIds

        basicSkillsChecked =
            Helper.uuidToCheckedList basicSkillIds

        otherFields =
            [ ( .certificateSkills, certificateSkills )
            , ( .otherTraining, otherTraining )
            , ( .numAction
              , Maybe.map .numAction fr
              )
            ]
                |> Helper.toKeyedList keys
    in
    Dict.fromList (mandatoryTrainingsChecked ++ basicSkillsChecked ++ otherFields)


maybePaymentRequestFormDict : Maybe PaymentRequest -> Maybe FundingRequest -> List Uuid -> List Uuid -> Maybe String -> Maybe String -> Dict String String
maybePaymentRequestFormDict maybePr fr basicSkillIds mandatoryTrainingIds certificateSkills otherTraining =
    case maybePr of
        Just paymentRequest ->
            toDict paymentRequest fr basicSkillIds mandatoryTrainingIds certificateSkills otherTraining

        Nothing ->
            defaultPaymentRequestFormDict fr basicSkillIds mandatoryTrainingIds certificateSkills otherTraining
