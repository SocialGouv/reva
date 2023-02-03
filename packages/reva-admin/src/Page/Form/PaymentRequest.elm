module Page.Form.PaymentRequest exposing (confirmationForm, form)

import Data.Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Certification exposing (Certification)
import Data.Form exposing (FormData)
import Data.Form.Helper
import Data.Form.PaymentRequest
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)
import Page.Form.FundingRequest as FundingRequest
import String exposing (String)


keys =
    Data.Form.PaymentRequest.keys


form : Maybe Certification -> FormData -> ( Candidacy, Referential ) -> Form
form maybeCertification formData ( candidacy, referential ) =
    let
        availableCompanions : List ( String, String )
        availableCompanions =
            candidacy.availableCompanions
                |> Data.Form.Helper.toIdList

        costElement : Form.Element
        costElement =
            Form.Number "Coût horaire"

        estimatedHourCountElement : Form.Element
        estimatedHourCountElement =
            Form.Number "Nb d'heures prévues"

        hourCountElement field =
            let
                numberElement =
                    Form.Number "Nb d'heures réalisées"
            in
            case Data.Form.get (field keys) formData of
                Nothing ->
                    Form.ReadOnlyElement numberElement

                Just "0" ->
                    Form.ReadOnlyElement numberElement

                Just _ ->
                    numberElement
    in
    { elements =
        [ ( "heading", Form.Heading "1 - Informations des prestations" )
        , ( "selected-certification", Form.Section "Certification choisie par le candidat" )
        , ( "certification"
          , maybeCertification
                |> Maybe.map (.label >> Form.Info "")
                |> Maybe.withDefault Form.Empty
          )
        , ( "funding-num-action", Form.Section "Numéro de prise en charge Reva" )
        , ( "num-action"
          , Data.Form.get keys.numAction formData
                |> Maybe.map (Form.Info "")
                |> Maybe.withDefault Form.Empty
          )
        , ( "organism", Form.Section "Accompagnement architecte de parcours" )
        , ( "diagnosis", Form.Title "Entretien(s) de faisabilité" )
        , ( "diagnosisReview"
          , Form.ReadOnlyElements
                [ ( keys.diagnosisEstimatedHourCount, estimatedHourCountElement )
                , ( keys.diagnosisCost, costElement )
                ]
          )
        , ( keys.diagnosisHourCount, hourCountElement .diagnosisEstimatedHourCount )
        , ( "post-exam", Form.Title "Entretien post jury" )
        , ( "diagnosisReview"
          , Form.ReadOnlyElements
                [ ( keys.postExamEstimatedHourCount, estimatedHourCountElement )
                , ( keys.postExamCost, costElement )
                ]
          )
        , ( keys.postExamHourCount, hourCountElement .postExamEstimatedHourCount )
        , ( "companion", Form.Section "Accompagnement méthodologique" )
        , ( keys.companionId
          , Form.ReadOnlyElement <|
                Form.Select "Accompagnateur choisi par le candidat" availableCompanions
          )
        , ( "individual", Form.Title "Accompagnement individuel" )
        , ( "individualReview"
          , Form.ReadOnlyElements
                [ ( keys.individualEstimatedHourCount, estimatedHourCountElement )
                , ( keys.individualCost, costElement )
                ]
          )
        , ( keys.individualHourCount, hourCountElement .individualEstimatedHourCount )
        , ( "collective", Form.Title "Accompagnement collectif" )
        , ( "individualReview"
          , Form.ReadOnlyElements
                [ ( keys.collectiveEstimatedHourCount, estimatedHourCountElement )
                , ( keys.collectiveCost, costElement )
                ]
          )
        , ( keys.collectiveHourCount, hourCountElement .collectiveEstimatedHourCount )
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
                , ( keys.mandatoryTrainingsCost, Form.ReadOnlyElement <| costElement )
                ]
          )
        , ( keys.mandatoryTrainingsHourCount, hourCountElement .mandatoryTrainingsEstimatedHourCount )
        , ( "basic-skills", Form.Title "Formations savoirs de base" )
        , ( keys.basicSkillsIds
          , Form.ReadOnlyElement <|
                Form.CheckboxList "" <|
                    Data.Form.Helper.toIdList referential.basicSkills
          )
        , ( "basicSkillsReview"
          , Form.ReadOnlyElements
                [ ( keys.basicSkillsEstimatedHourCount, estimatedHourCountElement )
                , ( keys.basicSkillsCost, costElement )
                ]
          )
        , ( keys.basicSkillsHourCount, hourCountElement .basicSkillsEstimatedHourCount )
        , ( "skills", Form.Title "Bloc de compétences certifiant" )
        , ( keys.certificateSkills, Form.ReadOnlyElement <| Form.Textarea "" Nothing )
        , ( "certificateSkillsReview"
          , Form.ReadOnlyElements
                [ ( keys.certificateSkillsEstimatedHourCount, estimatedHourCountElement )
                , ( keys.certificateSkillsCost, costElement )
                ]
          )
        , ( keys.certificateSkillsHourCount, hourCountElement .certificateSkillsEstimatedHourCount )
        , ( "other", Form.Title "Autres actions de formations complémentaires" )
        , ( keys.otherTraining, Form.ReadOnlyElement <| Form.Textarea "" Nothing )
        , ( keys.totalTrainingHourCount
          , Form.Info "Nb d'heures total actes formatifs" <|
                String.fromInt (FundingRequest.totalTrainingHourCount formData)
          )
        , ( "jury", Form.Title "Prestation jury" )
        , ( "examReview"
          , Form.ReadOnlyElements
                [ ( keys.examEstimatedHourCount, estimatedHourCountElement )
                , ( keys.examCost, costElement )
                ]
          )
        , ( keys.examHourCount, hourCountElement .examEstimatedHourCount )
        , ( "total", Form.Section "Total" )
        , FundingRequest.totalCostSection "Coût total de la demande de paiement" formData
        , ( keys.invoiceNumber, Form.InputRequired "Numéro de facture" )
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = "Demande de paiement"
    }


confirmationForm : FormData -> ( Candidacy, Referential ) -> Form
confirmationForm formData ( _, _ ) =
    { elements =
        [ ( "heading", Form.Heading "3 - Confirmation" )
        , ( "num-action"
          , Data.Form.get keys.numAction formData
                |> Maybe.map (Form.Info "Numéro de prise en charge Reva")
                |> Maybe.withDefault Form.Empty
          )
        , ( "invoice-number"
          , Data.Form.get keys.invoiceNumber formData
                |> Maybe.map (Form.Info "Numéro de facture")
                |> Maybe.withDefault Form.Empty
          )
        , FundingRequest.totalCostSection "Coût total de la demande de paiement" formData
        , ( keys.isFormConfirmed
          , Form.Checkbox "Je confirme ce montant de paiement. Je ne pourrai pas modifier cette demande de paiement après son envoi."
          )
        ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer"
    , title = "Demande de paiement"
    }
