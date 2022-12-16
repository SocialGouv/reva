module Page.Form.FundingRequest exposing (..)

import Data.Candidacy as Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Candidate
import Data.Certification exposing (Certification)
import Data.Form.FundingRequest
import Data.Form.Helper
import Data.Referential exposing (Referential)
import Dict exposing (Dict)
import List.Extra
import Page.Form as Form exposing (Form)
import String exposing (String)


form : Maybe Certification -> Dict String String -> ( Candidacy, Referential ) -> Form
form maybeCertification formData ( candidacy, referential ) =
    let
        baseTitle =
            "Demande de prise en charge"

        title =
            Dict.get keys.numAction formData
                |> Maybe.map (\numAction -> baseTitle ++ " " ++ numAction)
                |> Maybe.withDefault baseTitle

        keys =
            Data.Form.FundingRequest.keys

        availableCompanions : List ( String, String )
        availableCompanions =
            candidacy.availableCompanions
                |> Data.Form.Helper.toIdList

        certificateField : ( String, Form.Element )
        certificateField =
            case maybeCertification of
                Just certification ->
                    ( "certification", Form.Info "" certification.label )

                Nothing ->
                    ( "certification", Form.Empty )

        maybeReadOnlyTraining : Form.Element -> Form.Element
        maybeReadOnlyTraining formElement =
            if
                candidacy.candidate
                    |> Maybe.map (hasAccessTrainingFunding referential)
                    |> Maybe.withDefault False
            then
                formElement

            else
                Form.ReadOnlyElement formElement

        checked : List { a | id : String } -> List String
        checked ids =
            Data.Form.Helper.selection formData ids

        withCheckedRequired : List { a | id : String } -> Form.Element -> Form.Element
        withCheckedRequired ids formElement =
            withRequired (List.length (checked ids) /= 0) formElement

        hasCertificateSkills : Bool
        hasCertificateSkills =
            Dict.get keys.certificateSkills formData
                |> Maybe.map ((/=) "")
                |> Maybe.withDefault False

        withRequired : Bool -> Form.Element -> Form.Element
        withRequired condition formElement =
            case formElement of
                Form.ReadOnlyElement _ ->
                    formElement

                _ ->
                    if condition then
                        formElement

                    else
                        Form.ReadOnlyElement formElement
    in
    { elements =
        [ ( "heading", Form.Heading "2 - Parcours personnalisé" )
        , ( "selected-certification", Form.Section "Certification choisie par le candidat" )
        , certificateField
        , ( "organism", Form.Section "Accompagnement architecte de parcours" )
        , ( "diagnosis", Form.Title "Entretien(s) de faisabilité" )
        , ( keys.diagnosisHourCount, Form.Number "Nombre d'heures" )
        , ( keys.diagnosisCost, Form.Number "Coût horaire" )
        , ( "post-exam", Form.Title "Entretien post jury" )
        , ( keys.postExamHourCount, Form.Number "Nombre d'heures" )
        , ( keys.postExamCost, Form.Number "Coût horaire" )
        , ( "companion", Form.Section "Accompagnement méthodologique" )
        , ( keys.companionId, Form.Select "Accompagnateur choisi par le candidat" availableCompanions )
        , ( "individual", Form.Title "Accompagnement individuel" )
        , ( keys.individualHourCount, Form.Number "Nombre d'heures" )
        , ( keys.individualCost, Form.Number "Coût horaire" )
        , ( "collective", Form.Title "Accompagnement collectif" )
        , ( keys.collectiveHourCount, Form.Number "Nombre d'heures" )
        , ( keys.collectiveCost, Form.Number "Coût horaire" )
        , ( "training", Form.Section "Actes formatifs" )
        , ( "mandatory", Form.Title "Formations obligatoires" )
        , ( keys.mandatoryTrainingIds
          , Form.ReadOnlyElement <|
                Form.CheckboxList "" <|
                    Data.Form.Helper.toIdList referential.mandatoryTrainings
          )
        , ( keys.mandatoryTrainingsHourCount
          , Form.Number "Nombre d'heures"
                |> maybeReadOnlyTraining
                |> withCheckedRequired referential.mandatoryTrainings
          )
        , ( keys.mandatoryTrainingsCost
          , Form.Number "Coût horaire"
                |> maybeReadOnlyTraining
                |> withCheckedRequired referential.mandatoryTrainings
          )
        , ( "basic-skills", Form.Title "Formations savoirs de base" )
        , ( keys.basicSkillsIds
          , Form.ReadOnlyElement <|
                Form.CheckboxList "" <|
                    Data.Form.Helper.toIdList referential.basicSkills
          )
        , ( keys.basicSkillsHourCount
          , Form.Number "Nombre d'heures"
                |> maybeReadOnlyTraining
                |> withCheckedRequired referential.basicSkills
          )
        , ( keys.basicSkillsCost
          , Form.Number "Coût horaire"
                |> maybeReadOnlyTraining
                |> withCheckedRequired referential.basicSkills
          )
        , ( "skills", Form.Title "Bloc de compétences certifiant" )
        , ( keys.certificateSkills, Form.ReadOnlyElement <| Form.Textarea "" )
        , ( keys.certificateSkillsHourCount
          , Form.Number "Nombre d'heures"
                |> maybeReadOnlyTraining
                |> withRequired hasCertificateSkills
          )
        , ( keys.certificateSkillsCost
          , Form.Number "Coût horaire"
                |> maybeReadOnlyTraining
                |> withRequired hasCertificateSkills
          )
        , ( "other", Form.Title "Autres actions de formations complémentaires" )
        , ( keys.otherTraining, Form.ReadOnlyElement <| Form.Textarea "" )
        , ( keys.otherTrainingHourCount
          , Form.Info "Nombre d'heures total actes formatifs" <|
                String.fromInt (totalTrainingHourCount formData)
          )
        , ( "jury", Form.Title "Prestation jury" )
        , ( keys.examHourCount, Form.Number "Nombre d'heures" )
        , ( keys.examCost, Form.Number "Coût horaire" )
        , ( "total", Form.Section "Total" )
        , ( "totalCost"
          , Form.Info "Coût total de la demande de prise en charge" <|
                String.concat
                    [ String.fromInt (totalFundingRequestCost formData)
                    , "€"
                    ]
          )
        , if Candidacy.isStatusEqualOrAbove candidacy "DEMANDE_FINANCEMENT_ENVOYE" then
            ( "", Form.Empty )

          else
            ( keys.isFormConfirmed, Form.Checkbox "Je confirme ce montant de prise en charge. Je ne pourrai pas éditer cette demande de prise en charge après son envoi." )
        ]
    , saveLabel = "Envoyer"
    , title = title
    }


hasAccessTrainingFunding : Referential -> Data.Candidate.Candidate -> Bool
hasAccessTrainingFunding referential candidate =
    let
        maybeBac =
            List.Extra.find (\d -> d.code == "N4_BAC") referential.degrees
    in
    case ( candidate.highestDegree, candidate.vulnerabilityIndicator, maybeBac ) of
        ( Just highestDegree, Just vulnerabilityIndicator, Just bac ) ->
            highestDegree.level <= bac.level || vulnerabilityIndicator.label /= "Vide"

        _ ->
            False


totalTrainingHourCount : Dict String String -> Int
totalTrainingHourCount formData =
    let
        keys =
            Data.Form.FundingRequest.keys

        decode =
            Data.Form.Helper.decode keys formData

        int f =
            decode.int f 0
    in
    int .mandatoryTrainingsHourCount
        + int .basicSkillsHourCount
        + int .certificateSkillsHourCount


totalFundingRequestCost : Dict String String -> Int
totalFundingRequestCost formData =
    let
        keys =
            Data.Form.FundingRequest.keys

        decode =
            Data.Form.Helper.decode keys formData

        int f =
            decode.int f 0
    in
    (int .diagnosisHourCount * int .diagnosisCost)
        + (int .postExamHourCount * int .postExamCost)
        + (int .individualHourCount * int .individualCost)
        + (int .collectiveHourCount * int .collectiveCost)
        + (int .mandatoryTrainingsHourCount * int .mandatoryTrainingsCost)
        + (int .basicSkillsHourCount * int .basicSkillsCost)
        + (int .certificateSkillsHourCount * int .certificateSkillsCost)
        + (int .examHourCount * int .examCost)
