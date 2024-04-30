module Page.Form.FundingRequestUniReva exposing (  totalCostSection, totalTrainingHourCount)

import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import Data.Form exposing (FormData)
import Data.Form.FundingRequestUniReva
import Data.Form.Helper
import Page.Form as Form 
import String exposing (String)
keys =
    Data.Form.FundingRequestUniReva.keys



totalCostSection : String -> FormData -> ( String, Form.Element )
totalCostSection sectionTitle formData =
    ( "totalCost"
    , Form.Info sectionTitle <|
        String.concat
            [ String.fromFloat (totalCost formData)
            , "€"
            ]
    )



totalTrainingHourCount : FormData -> Int
totalTrainingHourCount formData =
    let
        decode =
            Data.Form.Helper.decode keys formData

        int f =
            decode.int f 0
    in
    int .mandatoryTrainingsHourCount
        + int .basicSkillsHourCount
        + int .certificateSkillsHourCount
        + int .otherTrainingHourCount


totalCost : FormData -> Float
totalCost formData =
    let
        decode =
            Data.Form.Helper.decode keys formData

        float f =
            decode.float f 0

        roundCost =
            (\x -> x * 100)
                >> truncate
                >> toFloat
                >> (\x -> x / 100)

        cost =
            (float .diagnosisHourCount * float .diagnosisCost)
                + (float .postExamHourCount * float .postExamCost)
                + (float .individualHourCount * float .individualCost)
                + (float .collectiveHourCount * float .collectiveCost)
                + (float .mandatoryTrainingsHourCount * float .mandatoryTrainingsCost)
                + (float .basicSkillsHourCount * float .basicSkillsCost)
                + (float .certificateSkillsHourCount * float .certificateSkillsCost)
                + (float .otherTrainingHourCount * float .otherTrainingCost)
                + (float .examHourCount * float .examCost)
    in
    roundCost cost
