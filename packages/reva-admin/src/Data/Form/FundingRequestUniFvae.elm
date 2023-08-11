module Data.Form.FundingRequestUniFvae exposing (keys, validate)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Referential exposing (Referential)


keys =
    { canidateSecondname = "canidateSecondname"
    , canidateThirdname = "canidateThirdname"
    , candidateGender = "candidateGender"
    , individualHourCount = "individualHourCount"
    , individualCost = "individualCost"
    , collectiveHourCount = "collectiveHourCount"
    , collectiveCost = "collectiveCost"
    , mandatoryTrainingHourCount = "mandatoryTrainingHourCount"
    , mandatoryTrainingCost = "mandatoryTrainingCost"
    , basicSkillsHourCount = "basicSkillsHourCount"
    , basicSkillsCost = "basicSkillsCost"
    , certificateSkillsHourCount = "certificateSkillsHourCount"
    , certificateSkillsCost = "certificateSkillsCost"
    , otherSkillsHourCount = "certificateSkillsCost"
    , otherSkillsCost = "certificateSkillsCost"
    }


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( candidacy, _ ) formData =
    Result.Ok ()
