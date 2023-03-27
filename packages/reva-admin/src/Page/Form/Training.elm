module Page.Form.Training exposing (..)

import Css exposing (true)
import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Training
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)
import String exposing (String)


form : FormData -> ( Candidacy, Referential ) -> Form
form formData ( _, referential ) =
    let
        keys =
            Data.Form.Training.keys

        toCheckBoxDescriptionList : List { a | id : String, label : String } -> List { id : String, label : String, disabled : Bool }
        toCheckBoxDescriptionList l =
            let
                isTrainingDisabled : { a | id : String, label : String } -> Bool
                isTrainingDisabled training =
                    let
                        afgsuTrainingId =
                            .id <| Maybe.withDefault { id = "", label = "" } <| List.head <| List.filter (\mandatoryTraining -> mandatoryTraining.label == "Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU)") referential.mandatoryTrainings

                        trainingFormData =
                            Data.Form.Training.fromDict referential.basicSkills referential.mandatoryTrainings formData

                        checkedMandatoryTrainingIds =
                            trainingFormData.mandatoryTrainingIds

                        isAfgsuTrainingChecked =
                            List.member afgsuTrainingId checkedMandatoryTrainingIds

                        isTrainingMandatory =
                            List.member training.id <| List.map (\r -> r.id) referential.mandatoryTrainings

                        isTrainingAfgsu =
                            training.id == afgsuTrainingId

                        atLeastOneMandatoryTrainingChecked =
                            not (List.isEmpty checkedMandatoryTrainingIds)
                    in
                    -- For mandatory trainings if afgsu is checked the other three are disabled and vice versa
                    if isTrainingMandatory && atLeastOneMandatoryTrainingChecked then
                        if isAfgsuTrainingChecked then
                            not isTrainingAfgsu

                        else
                            isTrainingAfgsu

                    else
                        False
            in
            List.map (\e -> { id = e.id, label = e.label, disabled = isTrainingDisabled e }) l
    in
    { elements =
        [ ( keys.individualHourCount, Form.Number "Nombre d'heures d'accompagnement individuel" )
        , ( keys.collectiveHourCount, Form.Number "Nombre d'heures d'accompagnement collectif" )
        , ( keys.additionalHourCount, Form.Number "Nombre d'heures de formations complémentaires" )
        , ( keys.mandatoryTrainings
          , Form.CheckboxList "Formations obligatoires" <|
                toCheckBoxDescriptionList referential.mandatoryTrainings
          )
        , ( keys.basicSkills
          , Form.CheckboxList "Savoirs de base" <|
                toCheckBoxDescriptionList referential.basicSkills
          )
        , ( keys.certificateSkills, Form.Textarea "Blocs de compétences métier" (Just "RNCP25467BC03 - intitulé") )
        , ( keys.otherTraining, Form.Textarea "Autres actions de formations complémentaires" Nothing )
        , ( keys.isCertificationPartial, Form.Checkbox "Le candidat a un objectif de certification partielle." )
        ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer le parcours"
    , title = "Définition du parcours"
    }
