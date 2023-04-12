module Page.Form.PaymentRequest exposing (confirmationForm, form)

import Data.Candidacy exposing (Candidacy)
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

        estimatedCostElement : Form.Element
        estimatedCostElement =
            Form.Number "Coût horaire prévu"

        estimatedHourCountElement : Form.Element
        estimatedHourCountElement =
            Form.Number "Nb d'heures prévues"

        hourCountElement =
            Form.Number "Nb d'heures réalisées"

        costElement =
            Form.Price "Coût horaire"
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
                , ( keys.diagnosisEstimatedCost, estimatedCostElement )
                ]
          )
        , ( keys.diagnosisHourCount, hourCountElement )
        , ( keys.diagnosisCost, costElement )
        , ( "post-exam", Form.Title "Entretien post jury" )
        , ( "diagnosisReview"
          , Form.ReadOnlyElements
                [ ( keys.postExamEstimatedHourCount, estimatedHourCountElement )
                , ( keys.postExamEstimatedCost, estimatedCostElement )
                ]
          )
        , ( keys.postExamHourCount, hourCountElement )
        , ( keys.postExamCost, costElement )
        , ( "companion", Form.Section "Accompagnement méthodologique" )
        , ( keys.companionId
          , Form.ReadOnlyElement <|
                Form.Select "Accompagnateur choisi par le candidat" availableCompanions
          )
        , ( "individual", Form.Title "Accompagnement individuel" )
        , ( "individualReview"
          , Form.ReadOnlyElements
                [ ( keys.individualEstimatedHourCount, estimatedHourCountElement )
                , ( keys.individualEstimatedCost, estimatedCostElement )
                ]
          )
        , ( keys.individualHourCount, hourCountElement )
        , ( keys.individualCost, costElement )
        , ( "collective", Form.Title "Accompagnement collectif" )
        , ( "individualReview"
          , Form.ReadOnlyElements
                [ ( keys.collectiveEstimatedHourCount, estimatedHourCountElement )
                , ( keys.collectiveEstimatedCost, estimatedCostElement )
                ]
          )
        , ( keys.collectiveHourCount, hourCountElement )
        , ( keys.collectiveCost, costElement )
        , ( "training", Form.Section "Actes formatifs" )
        , ( "mandatory", Form.Title "Formations obligatoires" )
        , ( keys.mandatoryTrainingIds
          , Form.ReadOnlyElement <|
                Form.CheckboxList "Formations obligatoires sélectionnées" <|
                    Data.Form.Helper.toCheckBoxDescriptionList True referential.mandatoryTrainings
          )
        , ( "mandatoryTrainingsReview"
          , Form.ReadOnlyElements
                [ ( keys.mandatoryTrainingsEstimatedHourCount, Form.ReadOnlyElement <| Form.Number "Nb d'heures prévues" )
                , ( keys.mandatoryTrainingsEstimatedCost, Form.ReadOnlyElement <| estimatedCostElement )
                ]
          )
        , ( keys.mandatoryTrainingsHourCount, hourCountElement )
        , ( keys.mandatoryTrainingsCost, costElement )
        , ( "basic-skills", Form.Title "Formations savoirs de base" )
        , ( keys.basicSkillsIds
          , Form.ReadOnlyElement <|
                Form.CheckboxList "Formations savoirs de base sélectionnées" <|
                    Data.Form.Helper.toCheckBoxDescriptionList True referential.basicSkills
          )
        , ( "basicSkillsReview"
          , Form.ReadOnlyElements
                [ ( keys.basicSkillsEstimatedHourCount, estimatedHourCountElement )
                , ( keys.basicSkillsEstimatedCost, estimatedCostElement )
                ]
          )
        , ( keys.basicSkillsHourCount, hourCountElement )
        , ( keys.basicSkillsCost, costElement )
        , ( "skills", Form.Title "Bloc de compétences certifiant" )
        , ( keys.certificateSkills, Form.ReadOnlyElement <| Form.Textarea "" Nothing )
        , ( "certificateSkillsReview"
          , Form.ReadOnlyElements
                [ ( keys.certificateSkillsEstimatedHourCount, estimatedHourCountElement )
                , ( keys.certificateSkillsEstimatedCost, estimatedCostElement )
                ]
          )
        , ( keys.certificateSkillsHourCount, hourCountElement )
        , ( keys.certificateSkillsCost, costElement )
        , ( "other", Form.Title "Autres actions de formations complémentaires" )
        , ( keys.otherTraining, Form.ReadOnlyElement <| Form.Textarea "Formations complémentaires" Nothing )
        , ( keys.otherTrainingHourCount, hourCountElement )
        , ( keys.otherTrainingCost, costElement )
        , ( keys.totalTrainingHourCount
          , Form.Info "Nb d'heures total actes formatifs" <|
                String.fromInt (FundingRequest.totalTrainingHourCount formData)
          )
        , ( "jury", Form.Title "Prestation jury" )
        , ( "examReview"
          , Form.ReadOnlyElements
                [ ( keys.examEstimatedHourCount, estimatedHourCountElement )
                , ( keys.examEstimatedCost, estimatedCostElement )
                ]
          )
        , ( keys.examHourCount, hourCountElement )
        , ( keys.examCost, costElement )
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
