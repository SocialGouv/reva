module Data.Form.Training exposing (fromDict, keys, training)

import Admin.Scalar exposing (Uuid)
import Data.Form.Helper as Helper exposing (booleanToString, toIdList, uuidToCheckedList)
import Data.Referential exposing (BasicSkill, MandatoryTraining)
import Dict exposing (Dict)


type alias Training =
    { mandatoryTrainingIds : List String
    , basicSkillsIds : List String
    , certificateSkills : String
    , consent : Bool
    , otherTraining : String
    , individualHourCount : Int
    , collectiveHourCount : Int
    , additionalHourCount : Int
    }


keys :
    { certificate : String
    , mandatoryTrainings : String
    , basicSkills : String
    , certificateSkills : String
    , otherTraining : String
    , individualHourCount : String
    , collectiveHourCount : String
    , additionalHourCount : String
    , consent : String
    }
keys =
    { certificate = "certificate"
    , mandatoryTrainings = "mandatory-training"
    , basicSkills = "basicSkills"
    , certificateSkills = "certificateSkills"
    , otherTraining = "otherTraining"
    , individualHourCount = "individualHourCount"
    , collectiveHourCount = "collectiveHourCount"
    , additionalHourCount = "additionalHourCount"
    , consent = "consent"
    }


fromDict : List BasicSkill -> List MandatoryTraining -> Dict String String -> Training
fromDict basicSkills mandatoryTrainings dict =
    let
        decode =
            Helper.decode keys dict
    in
    Training
        (decode.list mandatoryTrainings)
        (decode.list basicSkills)
        (decode.string .certificateSkills "")
        (decode.bool .consent False)
        (decode.string .otherTraining "")
        (decode.int .individualHourCount 0)
        (decode.int .collectiveHourCount 0)
        (decode.int .additionalHourCount 0)


training :
    List Uuid
    -> List Uuid
    -> Maybe String
    -> Maybe Bool
    -> Maybe String
    -> Maybe Int
    -> Maybe Int
    -> Maybe Int
    -> Dict String String
training mandatoryTrainings basicSkills certificateSkills consent otherTraining individualHourCount collectiveHourCount additionalHourCount =
    let
        mandatoryTrainingsIds =
            uuidToCheckedList mandatoryTrainings

        basicSkillsIds =
            uuidToCheckedList basicSkills

        otherTrainings =
            [ ( .certificateSkills, certificateSkills )
            , ( .consent, Maybe.map booleanToString consent )
            , ( .otherTraining, otherTraining )
            , ( .individualHourCount, Maybe.map String.fromInt individualHourCount )
            , ( .collectiveHourCount, Maybe.map String.fromInt collectiveHourCount )
            , ( .additionalHourCount, Maybe.map String.fromInt additionalHourCount )
            ]
                |> Helper.keysToCheckedList keys
    in
    Dict.fromList (mandatoryTrainingsIds ++ basicSkillsIds ++ otherTrainings)
