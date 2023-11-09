module Data.Form.Training exposing (Scope(..), Training, fromDict, keys, scopeFromString, scopeToString, training, validate)

import Admin.Scalar exposing (Uuid)
import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper exposing (booleanToString, uuidToCheckedList)
import Data.Referential exposing (BasicSkill, MandatoryTraining, Referential)
import Dict exposing (Dict)


type Scope
    = Partial
    | Full
    | Unknown


type alias Training =
    { mandatoryTrainingIds : List String
    , basicSkillsIds : List String
    , certificateSkills : String
    , consent : Bool
    , otherTraining : String
    , individualHourCount : Int
    , collectiveHourCount : Int
    , additionalHourCount : Int
    , certificationScope : Scope
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
    , certificationScope = "certificationScope"
    }


fullCertificationLabel : String
fullCertificationLabel =
    "La certification dans sa totalité"


partialCertificationLabel : String
partialCertificationLabel =
    "Un ou plusieurs bloc(s) de compétences"


scopeToString : Scope -> String
scopeToString scope =
    case scope of
        Full ->
            fullCertificationLabel

        Partial ->
            partialCertificationLabel

        Unknown ->
            "Inconnu"


scopeFromString : String -> Scope
scopeFromString scope =
    if scope == fullCertificationLabel then
        Full

    else if scope == partialCertificationLabel then
        Partial

    else
        Unknown


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate _ formData =
    let
        decode =
            Helper.decode keys formData
    in
    if (scopeFromString <| decode.string .certificationScope "") == Unknown then
        Err [ "Veuillez choisir si la certification est visée dans sa totalité ou non" ]

    else
        Ok ()


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
        (scopeFromString <| decode.string .certificationScope "")


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
            , ( .certificationScope
              , Just <|
                    scopeToString <|
                        if isCertificationPartial then
                            Partial

                        else
                            Full
              )
            ]
                |> Helper.toKeyedList keys
    in
    Dict.fromList (mandatoryTrainingsIds ++ basicSkillsIds ++ otherTrainings)
