module Data.Form.FundingRequestUniFvae exposing (FundingRequest, fromDict, keys, maybeFundingRequest, toDict, validate)

-- import Admin.Object.FundingRequestUnifvae exposing (fundingContactEmail, fundingContactFirstname, fundingContactLastname, fundingContactPhone)

import Admin.Enum.Gender exposing (Gender(..))
import Admin.Scalar exposing (Decimal, Uuid)
import Data.Candidacy exposing (Candidacy)
import Data.Candidate exposing (genderFromString, genderToString)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (BasicSkill, MandatoryTraining, Referential)
import Dict exposing (Dict)


keys =
    { candidateSecondname = "candidateSecondname"
    , candidateThirdname = "candidateThirdname"
    , candidateGender = "candidateGender"
    , individualHourCount = "individualHourCount"
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
    , fundingContactFirstname = "fundingContactFirstname"
    , fundingContactLastname = "fundingContactLastname"
    , fundingContactEmail = "fundingContactEmail"
    , fundingContactPhone = "fundingContactPhone"
    , confirmationChecked = "confirmationChecked"
    }


fromDict : List BasicSkill -> List MandatoryTraining -> FormData -> FundingRequest
fromDict basicSkillsIds mandatoryTrainingIds formData =
    let
        decode =
            Helper.decode keys formData
    in
    FundingRequest
        (decode.maybe.string .candidateSecondname)
        (decode.maybe.string .candidateThirdname)
        (decode.generic .candidateGender genderFromString Undisclosed)
        (decode.decimal .individualHourCount (Admin.Scalar.Decimal "0"))
        (decode.decimal .individualCost (Admin.Scalar.Decimal "0"))
        (decode.decimal .collectiveHourCount (Admin.Scalar.Decimal "0"))
        (decode.decimal .collectiveCost (Admin.Scalar.Decimal "0"))
        (decode.list basicSkillsIds)
        (decode.decimal .basicSkillsHourCount (Admin.Scalar.Decimal "0"))
        (decode.decimal .basicSkillsCost (Admin.Scalar.Decimal "0"))
        (decode.list mandatoryTrainingIds)
        (decode.decimal .mandatoryTrainingsHourCount (Admin.Scalar.Decimal "0"))
        (decode.decimal .mandatoryTrainingsCost (Admin.Scalar.Decimal "0"))
        (decode.string .certificateSkills "")
        (decode.decimal .certificateSkillsHourCount (Admin.Scalar.Decimal "0"))
        (decode.decimal .certificateSkillsCost (Admin.Scalar.Decimal "0"))
        (decode.string .otherTraining "")
        (decode.decimal .otherTrainingHourCount (Admin.Scalar.Decimal "0"))
        (decode.decimal .otherTrainingCost (Admin.Scalar.Decimal "0"))
        (decode.maybe.string .fundingContactFirstname)
        (decode.maybe.string .fundingContactLastname)
        (decode.maybe.string .fundingContactEmail)
        (decode.maybe.string .fundingContactPhone)


type alias FundingRequest =
    { candidateSecondname : Maybe String
    , candidateThirdname : Maybe String
    , candidateGender : Gender
    , individualHourCount : Decimal
    , individualCost : Decimal
    , collectiveHourCount : Decimal
    , collectiveCost : Decimal
    , basicSkillsIds : List String
    , basicSkillsHourCount : Decimal
    , basicSkillsCost : Decimal
    , mandatoryTrainingIds : List String
    , mandatoryTrainingsHourCount : Decimal
    , mandatoryTrainingsCost : Decimal
    , certificateSkills : String
    , certificateSkillsHourCount : Decimal
    , certificateSkillsCost : Decimal
    , otherTraining : String
    , otherTrainingHourCount : Decimal
    , otherTrainingCost : Decimal
    , fundingContactFirstname : Maybe String
    , fundingContactLastname : Maybe String
    , fundingContactEmail : Maybe String
    , fundingContactPhone : Maybe String
    }


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( candidacy, _ ) formData =
    let
        decode =
            Helper.decode keys formData

        error =
            Err [ "Veuillez confirmer le montant de la prise en charge." ]
    in
    if decode.bool .confirmationChecked False == True then
        Ok ()

    else
        error


toDict : FundingRequest -> Dict String String
toDict funding =
    let
        string key =
            Just <| key funding

        decimal key =
            Just <| Helper.decimalToString <| key funding

        mandatoryTrainingsChecked =
            Helper.toCheckedList funding.mandatoryTrainingIds

        basicSkillsChecked =
            Helper.toCheckedList funding.basicSkillsIds

        fundingList =
            [ ( .candidateSecondname, string (.candidateSecondname >> Maybe.withDefault "") )
            , ( .candidateGender, Just (genderToString funding.candidateGender) )
            , ( .candidateThirdname, string (.candidateThirdname >> Maybe.withDefault "") )
            , ( .individualHourCount, decimal .individualHourCount )
            , ( .individualCost, decimal .individualCost )
            , ( .collectiveHourCount, decimal .collectiveHourCount )
            , ( .collectiveCost, decimal .collectiveCost )
            , ( .basicSkillsHourCount, decimal .basicSkillsHourCount )
            , ( .basicSkillsCost, decimal .basicSkillsCost )
            , ( .mandatoryTrainingsHourCount, decimal .mandatoryTrainingsHourCount )
            , ( .mandatoryTrainingsCost, decimal .mandatoryTrainingsCost )
            , ( .certificateSkills, string .certificateSkills )
            , ( .certificateSkillsHourCount, decimal .certificateSkillsHourCount )
            , ( .certificateSkillsCost, decimal .certificateSkillsCost )
            , ( .otherTraining, string .otherTraining )
            , ( .otherTrainingHourCount, decimal .otherTrainingHourCount )
            , ( .otherTrainingCost, decimal .otherTrainingCost )
            , ( .fundingContactFirstname, string (.fundingContactFirstname >> Maybe.withDefault "") )
            , ( .fundingContactLastname, string (.fundingContactLastname >> Maybe.withDefault "") )
            , ( .fundingContactEmail, string (.fundingContactEmail >> Maybe.withDefault "") )
            , ( .fundingContactPhone, string (.fundingContactPhone >> Maybe.withDefault "") )
            ]
                |> Helper.toKeyedList keys
    in
    Dict.fromList (mandatoryTrainingsChecked ++ basicSkillsChecked ++ fundingList)


defaultFundingRequest : List Uuid -> List Uuid -> Maybe String -> Maybe String -> Dict String String
defaultFundingRequest basicSkillIds mandatoryTrainingIds certificateSkills otherTraining =
    let
        mandatoryTrainingsChecked =
            Helper.uuidToCheckedList mandatoryTrainingIds

        basicSkillsChecked =
            Helper.uuidToCheckedList basicSkillIds

        otherFields =
            [ ( .certificateSkills, certificateSkills )
            , ( .otherTraining, otherTraining )
            ]
                |> Helper.toKeyedList keys
    in
    Dict.fromList (mandatoryTrainingsChecked ++ basicSkillsChecked ++ otherFields)


maybeFundingRequest : Maybe FundingRequest -> List Uuid -> List Uuid -> Maybe String -> Maybe String -> Dict String String
maybeFundingRequest maybeFr basicSkillIds mandatoryTrainingIds certificateSkills otherTraining =
    case maybeFr of
        Just funding ->
            toDict funding

        Nothing ->
            defaultFundingRequest basicSkillIds mandatoryTrainingIds certificateSkills otherTraining
