module Data.Form.Training exposing (Scope(..), Training)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))


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
