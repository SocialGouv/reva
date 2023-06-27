module Data.Form.Training exposing (Training, fromDict, keys, training)

import Admin.Scalar exposing (Uuid)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper exposing (booleanToString, uuidToCheckedList)
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
    , isCertificationPartial : Bool
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
    , isCertificationPartial = "isCertificationPartial"
    }


fromDict : List BasicSkill -> List MandatoryTraining -> FormData -> Training
fromDict basicSkills mandatoryTrainings formData =
    let
        decode =
            Helper.decode keys formData
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
        (decode.bool .isCertificationPartial False)


training :
    List Uuid
    -> List Uuid
    -> Maybe String
    -> Maybe String
    -> Maybe Int
    -> Maybe Int
    -> Maybe Int
    -> Bool
    -> Dict String String
training mandatoryTrainings basicSkills certificateSkills otherTraining individualHourCount collectiveHourCount additionalHourCount isCertificationPartial =
    let
        mandatoryTrainingsIds =
            uuidToCheckedList mandatoryTrainings

        basicSkillsIds =
            uuidToCheckedList basicSkills

        otherTrainings =
            [ ( .certificateSkills, certificateSkills )
            , ( .otherTraining, otherTraining )
            , ( .individualHourCount, Maybe.map String.fromInt individualHourCount )
            , ( .collectiveHourCount, Maybe.map String.fromInt collectiveHourCount )
            , ( .additionalHourCount, Maybe.map String.fromInt additionalHourCount )
            , ( .isCertificationPartial, Just <| booleanToString isCertificationPartial )
            ]
                |> Helper.toKeyedList keys
    in
    Dict.fromList (mandatoryTrainingsIds ++ basicSkillsIds ++ otherTrainings)
