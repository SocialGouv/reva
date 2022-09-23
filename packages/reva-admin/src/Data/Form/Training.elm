module Data.Form.Training exposing (degreeToString, fromDict, keys, training, vulnerabilityIndicatorToString)

import Admin.Enum.CandidateDegree exposing (CandidateDegree(..))
import Admin.Enum.CandidateVulnerabilityIndicator exposing (CandidateVulnerabilityIndicator(..))
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
    { additionalHourCount : String
    , basicSkills : String
    , certificate : String
    , certificateSkills : String
    , collectiveHourCount : String
    , consent : String
    , individualHourCount : String
    , highestDegree : String
    , mandatoryTrainings : String
    , otherTraining : String
    , vulnerabilityIndicator : String
    }
keys =
    { additionalHourCount = "additionalHourCount"
    , basicSkills = "basicSkills"
    , certificate = "certificate"
    , certificateSkills = "certificateSkills"
    , collectiveHourCount = "collectiveHourCount"
    , consent = "consent"
    , individualHourCount = "individualHourCount"
    , highestDegree = "highestDegree"
    , mandatoryTrainings = "mandatoryTraining"
    , otherTraining = "otherTraining"
    , vulnerabilityIndicator = "vulnerabilityIndicator"
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


vulnerabilityIndicatorToString : CandidateVulnerabilityIndicator -> String
vulnerabilityIndicatorToString indicator =
    case indicator of
        DemandeurEmploiSup12m ->
            "Demandeur d'emploi >12m"

        MinimaSociaux ->
            "Bénéficiaire de minima sociaux"

        Rqth ->
            "RQTH"

        Vide ->
            "Vide"


degreeToString : CandidateDegree -> String
degreeToString degree =
    case degree of
        N1Sans ->
            "Niveau 1 : Sans qualification (hors Cléa)"

        N2Clea ->
            "Niveau 2 : Cléa"

        N3CapBep ->
            "Niveau 3 : CAP, BEP"

        N4Bac ->
            "Niveau 4 : Baccalauréat"

        N5Bac2 ->
            "Niveau 5 : Bac + 2 (DEUG, BTS, DUT, DEUST)"

        N6Bac34 ->
            "Niveau 6 : Bac + 3 (Licence, Licence LMD, licence professionnelle) et Bac + 4 (Maîtrise)"

        N7Bac5 ->
            "Niveau 7 : Bac + 5 (Master, DEA, DESS, diplôme d'ingénieur)"

        N8Bac8 ->
            "Niveau 8 : Bac + 8 (Doctorat, habilitation à diriger des recherches)"
