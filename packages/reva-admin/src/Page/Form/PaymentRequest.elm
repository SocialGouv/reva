module Page.Form.PaymentRequest exposing (form)

import Data.Candidacy as Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Candidate
import Data.Certification exposing (Certification)
import Data.Form.Helper
import Data.Form.PaymentRequest
import Data.Referential exposing (Referential)
import Dict exposing (Dict)
import List.Extra
import Page.Form as Form exposing (Form)
import String exposing (String)


keys =
    Data.Form.PaymentRequest.keys


form : Maybe Certification -> Dict String String -> ( Candidacy, Referential ) -> Form
form maybeCertification formData ( candidacy, referential ) =
    let
        availableCompanions : List ( String, String )
        availableCompanions =
            candidacy.availableCompanions
                |> Data.Form.Helper.toIdList

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
        , case maybeCertification of
            Just certification ->
                ( "certification", Form.Info "" certification.label )

            Nothing ->
                ( "certification", Form.Empty )
        , ( "organism", Form.Section "Accompagnement architecte de parcours" )
        , ( "diagnosis", Form.Title "Entretien(s) de faisabilité" )
        , ( "diagnosisReview"
          , Form.ReadOnlyElements
                [ ( keys.diagnosisEstimatedHourCount, Form.Number "Nb d'heures prévues" )
                , ( keys.diagnosisCost, Form.Number "Coût horaire" )
                ]
          )
        , ( keys.diagnosisHourCount, Form.Number "Nb d'heures réalisées" )
        , ( "post-exam", Form.Title "Entretien post jury" )
        , ( "diagnosisReview"
          , Form.ReadOnlyElements
                [ ( keys.postExamEstimatedHourCount, Form.Number "Nb d'heures prévues" )
                , ( keys.postExamCost, Form.Number "Coût horaire" )
                ]
          )
        , ( keys.postExamHourCount, Form.Number "Nb d'heures réalisées" )
        , ( "companion", Form.Section "Accompagnement méthodologique" )
        , ( keys.companionId, Form.Select "Accompagnateur choisi par le candidat" availableCompanions )
        , ( "individual", Form.Title "Accompagnement individuel" )
        , ( "individualReview"
          , Form.ReadOnlyElements
                [ ( keys.individualEstimatedHourCount, Form.Number "Nb d'heures prévues" )
                , ( keys.individualCost, Form.Number "Coût horaire" )
                ]
          )
        , ( keys.individualHourCount, Form.Number "Nb d'heures réalisées" )
        , ( "collective", Form.Title "Accompagnement collectif" )
        , ( "individualReview"
          , Form.ReadOnlyElements
                [ ( keys.collectiveEstimatedHourCount, Form.Number "Nb d'heures prévues" )
                , ( keys.collectiveCost, Form.Number "Coût horaire" )
                ]
          )
        , ( keys.collectiveHourCount, Form.Number "Nb d'heures réalisées" )
        , ( "training", Form.Section "Actes formatifs" )
        , ( "mandatory", Form.Title "Formations obligatoires" )
        , ( keys.mandatoryTrainingIds
          , Form.ReadOnlyElement <|
                Form.CheckboxList "" <|
                    Data.Form.Helper.toIdList referential.mandatoryTrainings
          )
        , ( "mandatoryTrainingsReview"
          , Form.ReadOnlyElements
                [ ( keys.mandatoryTrainingsEstimatedHourCount, Form.ReadOnlyElement <| Form.Number "Nb d'heures prévues" )
                , ( keys.mandatoryTrainingsCost, Form.ReadOnlyElement <| Form.Number "Coût horaire" )
                ]
          )
        , ( keys.mandatoryTrainingsHourCount, Form.Number "Nb d'heures réalisées" )
        , ( "basic-skills", Form.Title "Formations savoirs de base" )
        , ( keys.basicSkillsIds
          , Form.ReadOnlyElement <|
                Form.CheckboxList "" <|
                    Data.Form.Helper.toIdList referential.basicSkills
          )
        , ( "basicSkillsReview"
          , Form.ReadOnlyElements
                [ ( keys.basicSkillsEstimatedHourCount, Form.Number "Nb d'heures prévues" )
                , ( keys.basicSkillsCost, Form.Number "Coût horaire" )
                ]
          )
        , ( keys.basicSkillsHourCount, Form.Number "Nb d'heures réalisées" )
        , ( "skills", Form.Title "Bloc de compétences certifiant" )
        , ( keys.certificateSkills, Form.ReadOnlyElement <| Form.Textarea "" Nothing )
        , ( "certificateSkillsReview"
          , Form.ReadOnlyElements
                [ ( keys.certificateSkillsEstimatedHourCount, Form.Number "Nb d'heures prévues" )
                , ( keys.certificateSkillsCost, Form.Number "Coût horaire" )
                ]
          )
        , ( keys.certificateSkillsHourCount, Form.Number "Nb d'heures réalisées" )
        , ( "other", Form.Title "Autres actions de formations complémentaires" )
        , ( keys.otherTraining, Form.ReadOnlyElement <| Form.Textarea "" Nothing )
        , ( keys.totalTrainingHourCount
          , Form.Info "Nb d'heures prévue total actes formatifs" <|
                String.fromInt (totalTrainingHourCount formData)
          )
        , ( "jury", Form.Title "Prestation jury" )
        , ( "examReview"
          , Form.ReadOnlyElements
                [ ( keys.examEstimatedHourCount, Form.Number "Nb d'heures prévues" )
                , ( keys.examCost, Form.Number "Coût horaire" )
                ]
          )
        , ( keys.examHourCount, Form.Number "Nb d'heures réalisées" )
        , ( "total", Form.Section "Total" )
        , totalCostSection formData
        , confirmationSection candidacy
        ]
    , saveLabel = "Envoyer"
    , title = title formData
    }


title : Dict String String -> String
title formData =
    let
        baseTitle : String
        baseTitle =
            "Demande de prise en charge"
    in
    Dict.get keys.numAction formData
        |> Maybe.map (\numAction -> baseTitle ++ " " ++ numAction)
        |> Maybe.withDefault baseTitle


totalCostSection : Dict String String -> ( String, Form.Element )
totalCostSection formData =
    ( "totalCost"
    , Form.Info "Coût total de la demande de prise en charge" <|
        String.concat
            [ String.fromInt (totalFundingRequestCost formData)
            , "€"
            ]
    )


confirmationSection : Candidacy -> ( String, Form.Element )
confirmationSection candidacy =
    if Candidacy.isStatusEqualOrAbove candidacy "DEMANDE_FINANCEMENT_ENVOYE" then
        ( "", Form.Empty )

    else
        ( keys.isFormConfirmed, Form.Checkbox "Je confirme ce montant de prise en charge. Je ne pourrai pas éditer cette demande de prise en charge après son envoi." )


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
