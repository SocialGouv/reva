module Page.Form.PaymentRequest exposing (confirmationForm, form)

import Data.Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Certification exposing (Certification)
import Data.Form exposing (FormData)
import Data.Form.Helper
import Data.Form.PaymentRequest
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)
import Page.Form.FundingRequestUniReva as FundingRequest
import String exposing (String)
import View.Form


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

        emptyColumn =
            ( "", Form.StaticHtml <| View.Form.column [] [] )

        displayInfo key =
            ( key
            , Data.Form.get key formData
                |> Maybe.map (\s -> Form.StaticHtml <| View.Form.summary s)
                |> Maybe.withDefault Form.Empty
            )
    in
    { elements =
        [ ( "heading", Form.Title1 "1 - Informations des prestations" )
        , ( "selected-certification", Form.Title1 "Certification choisie par le candidat" )
        , ( "certification"
          , maybeCertification
                |> Maybe.map (.label >> Form.Info "")
                |> Maybe.withDefault Form.Empty
          )
        , ( "funding-num-action", Form.Title1 "2 - Numéro de prise en charge France VAE" )
        , ( "num-action"
          , Data.Form.get keys.numAction formData
                |> Maybe.map (Form.Info "")
                |> Maybe.withDefault Form.Empty
          )
        , ( "organism", Form.Title1 "3 - Parcours personnalisé" )
        , ( "organism", Form.Title2 "Entretien(s)" )
        , ( "diagnosis", Form.TitleInlined "Entretien(s) de faisabilité" )
        , ( "diagnosisReview"
          , Form.ReadOnlyElements
                [ ( keys.diagnosisEstimatedHourCount, estimatedHourCountElement )
                , ( keys.diagnosisEstimatedCost, estimatedCostElement )
                ]
          )
        , emptyColumn
        , ( keys.diagnosisHourCount, hourCountElement )
        , ( keys.diagnosisCost, costElement )
        , ( "post-exam", Form.TitleInlined "Entretien post jury" )
        , ( "diagnosisReview"
          , Form.ReadOnlyElements
                [ ( keys.postExamEstimatedHourCount, estimatedHourCountElement )
                , ( keys.postExamEstimatedCost, estimatedCostElement )
                ]
          )
        , emptyColumn
        , ( keys.postExamHourCount, hourCountElement )
        , ( keys.postExamCost, costElement )
        , ( "companion", Form.Title2 "Accompagnement" )
        , ( keys.companionId
          , Form.ReadOnlyElement <|
                Form.Select "Accompagnateur choisi par le candidat" availableCompanions
          )
        , ( "individual", Form.TitleInlined "Individuel" )
        , ( "individualReview"
          , Form.ReadOnlyElements
                [ ( keys.individualEstimatedHourCount, estimatedHourCountElement )
                , ( keys.individualEstimatedCost, estimatedCostElement )
                ]
          )
        , emptyColumn
        , ( keys.individualHourCount, hourCountElement )
        , ( keys.individualCost, costElement )
        , ( "collective", Form.TitleInlined "Collectif" )
        , ( "individualReview"
          , Form.ReadOnlyElements
                [ ( keys.collectiveEstimatedHourCount, estimatedHourCountElement )
                , ( keys.collectiveEstimatedCost, estimatedCostElement )
                ]
          )
        , emptyColumn
        , ( keys.collectiveHourCount, hourCountElement )
        , ( keys.collectiveCost, costElement )
        , ( "training", Form.Title2 "Compléments formatifs" )
        , ( "mandatory", Form.TitleInlined "Formations" )
        , ( "mandatoryTrainingsReview"
          , Form.ReadOnlyElements
                [ ( keys.mandatoryTrainingsEstimatedHourCount, Form.ReadOnlyElement <| Form.Number "Nb d'heures prévues" )
                , ( keys.mandatoryTrainingsEstimatedCost, Form.ReadOnlyElement <| estimatedCostElement )
                ]
          )
        , ( keys.mandatoryTrainingIds
          , Form.ReadOnlyElement <|
                Form.CheckboxList "Formations obligatoires sélectionnées" <|
                    Data.Form.Helper.toIdList referential.mandatoryTrainings
          )
        , ( keys.mandatoryTrainingsHourCount, hourCountElement )
        , ( keys.mandatoryTrainingsCost, costElement )
        , ( "basic-skills", Form.TitleInlined "Savoirs de base" )
        , ( "basicSkillsReview"
          , Form.ReadOnlyElements
                [ ( keys.basicSkillsEstimatedHourCount, estimatedHourCountElement )
                , ( keys.basicSkillsEstimatedCost, estimatedCostElement )
                ]
          )
        , ( keys.basicSkillsIds
          , Form.ReadOnlyElement <|
                Form.CheckboxList "" <|
                    Data.Form.Helper.toIdList referential.basicSkills
          )
        , ( keys.basicSkillsHourCount, hourCountElement )
        , ( keys.basicSkillsCost, costElement )
        , ( "skills", Form.TitleInlined "Bloc de compétences" )
        , ( "certificateSkillsReview"
          , Form.ReadOnlyElements
                [ ( keys.certificateSkillsEstimatedHourCount, estimatedHourCountElement )
                , ( keys.certificateSkillsEstimatedCost, estimatedCostElement )
                ]
          )
        , displayInfo keys.certificateSkills
        , ( keys.certificateSkillsHourCount, hourCountElement )
        , ( keys.certificateSkillsCost, costElement )
        , ( "other", Form.Title3 "Autres actions de formations" )
        , displayInfo keys.otherTraining
        , ( keys.otherTrainingHourCount, hourCountElement )
        , ( keys.otherTrainingCost, costElement )
        , ( "total-training", Form.TitleInlined "Total" )
        , ( keys.totalTrainingHourCount
          , Form.Info "Nb d'heures total actes formatifs" <|
                String.fromInt (FundingRequest.totalTrainingHourCount formData)
          )
        , ( "jury", Form.Title2 "Prestation jury" )
        , ( "examReview"
          , Form.ReadOnlyElements
                [ ( keys.examEstimatedHourCount, estimatedHourCountElement )
                , ( keys.examEstimatedCost, estimatedCostElement )
                ]
          )
        , ( keys.examHourCount, hourCountElement )
        , ( keys.examCost, costElement )
        , ( "total", Form.Title1 "Total" )
        , FundingRequest.totalCostSection "Coût total de la demande de paiement" formData
        , ( "", Form.Break )
        , ( keys.invoiceNumber, Form.InputRequired "Numéro de facture" )
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = "Demande de paiement"
    }


confirmationForm : FormData -> ( Candidacy, Referential ) -> Form
confirmationForm formData ( _, _ ) =
    { elements =
        [ ( "heading", Form.Title1 "3 - Confirmation" )
        , ( "num-action"
          , Data.Form.get keys.numAction formData
                |> Maybe.map (Form.Info "Numéro de prise en charge France VAE")
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
