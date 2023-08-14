module Data.Form.FundingRequestUniFvae exposing ( FundingRequestInput, fromDict, toDict, keys, validate)

import Admin.Enum.Gender exposing (Gender(..))
import Data.Candidacy exposing (Candidacy)
import Data.Candidate exposing (genderFromString, genderToString)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (Referential)
import Dict exposing (Dict)


keys =
    { candidateSecondname = "candidateSecondname"
    , candidateThirdname = "candidateThirdname"
    , candidateGender = "candidateGender"
    , individualHourCount = "individualHourCount"
    , individualCost = "individualCost"
    , collectiveHourCount = "collectiveHourCount"
    , collectiveCost = "collectiveCost"
    , mandatoryTrainingsHourCount = "mandatoryTrainingsHourCount"
    , mandatoryTrainingsCost = "mandatoryTrainingsCost"
    , basicSkillsHourCount = "basicSkillsHourCount"
    , basicSkillsCost = "basicSkillsCost"
    , certificateSkillsHourCount = "certificateSkillsHourCount"
    , certificateSkillsCost = "certificateSkillsCost"
    , otherTrainingHourCount = "otherTrainingHourCount"
    , otherTrainingCost = "otherTrainingCost"
    }



fromDict : FormData -> FundingRequestInput
fromDict formData =
    let
        decode =
            Helper.decode keys formData
    in
    FundingRequestInput
        (decode.maybe.string .candidateSecondname)
        (decode.maybe.string .candidateThirdname)
        (decode.generic .candidateGender genderFromString Undisclosed)
        (decode.float .individualHourCount 0)
        (decode.float .individualCost 0)
        (decode.float .collectiveHourCount 0)
        (decode.float .collectiveCost 0)
        (decode.float .basicSkillsHourCount 0)
        (decode.float .basicSkillsCost 0)
        (decode.float .mandatoryTrainingsHourCount 0)
        (decode.float .mandatoryTrainingsCost 0)
        (decode.float .certificateSkillsHourCount 0)
        (decode.float .certificateSkillsCost 0)
        (decode.float .otherTrainingHourCount 0)
        (decode.float .otherTrainingCost 0)


type alias FundingRequestInput =
    { candidateSecondname : Maybe String
    , candidateThirdname : Maybe String
    , candidateGender : Gender
    , individualHourCount : Float
    , individualCost : Float
    , collectiveHourCount : Float
    , collectiveCost : Float
    , basicSkillsHourCount : Float
    , basicSkillsCost : Float
    , mandatoryTrainingsHourCount : Float
    , mandatoryTrainingsCost : Float
    , certificateSkillsHourCount : Float
    , certificateSkillsCost : Float
    , otherTrainingHourCount : Float
    , otherTrainingCost : Float
    }


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( candidacy, _ ) formData =
    Result.Ok ()


toDict : FundingRequestInput -> Dict String String
toDict funding =
    let
        string key =
            Just <| key funding

        float key =
            Just <| String.fromFloat <| key funding

        fundingList =
            [ ( .candidateSecondname, string (.candidateSecondname >> Maybe.withDefault "") )
            , (.candidateGender,Just (genderToString (funding.candidateGender)))
            , ( .candidateThirdname, string (.candidateThirdname >> Maybe.withDefault "") )
            , ( .individualHourCount, float .individualHourCount )
            , ( .individualCost, float .individualCost )
            , ( .collectiveHourCount, float .collectiveHourCount )
            , ( .collectiveCost, float .collectiveCost )
            , ( .basicSkillsHourCount, float .basicSkillsHourCount )
            , ( .basicSkillsCost, float .basicSkillsCost )
            , ( .mandatoryTrainingsHourCount, float .mandatoryTrainingsHourCount )
            , ( .mandatoryTrainingsCost, float .mandatoryTrainingsCost )
            , ( .certificateSkillsHourCount, float .certificateSkillsHourCount )
            , ( .certificateSkillsCost, float .certificateSkillsCost )
            , ( .otherTrainingHourCount, float .otherTrainingHourCount )
            , ( .otherTrainingCost, float .otherTrainingCost )
            ]
                |> Helper.toKeyedList keys
    in
    Dict.fromList fundingList

