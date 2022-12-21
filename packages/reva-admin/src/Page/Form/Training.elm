module Page.Form.Training exposing (..)

import Data.Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Form.Helper
import Data.Form.Training
import Data.Referential exposing (Referential)
import Dict exposing (Dict)
import Page.Form as Form exposing (Form)
import String exposing (String)


form : Dict String String -> ( Candidacy, Referential ) -> Form
form _ ( _, referential ) =
    let
        keys =
            Data.Form.Training.keys
    in
    { elements =
        [ ( keys.individualHourCount, Form.Number "Nombre d'heures d'accompagnement individuel" )
        , ( keys.collectiveHourCount, Form.Number "Nombre d'heures d'accompagnement collectif" )
        , ( keys.additionalHourCount, Form.Number "Nombre d'heures de formations complémentaires" )
        , ( keys.mandatoryTrainings
          , Form.CheckboxList "Formations obligatoires" <|
                Data.Form.Helper.toIdList referential.mandatoryTrainings
          )
        , ( keys.basicSkills
          , Form.CheckboxList "Savoirs de base" <|
                Data.Form.Helper.toIdList referential.basicSkills
          )
        , ( keys.certificateSkills, Form.Textarea "Blocs de compétences métier" )
        , ( keys.otherTraining, Form.Textarea "Autres actions de formations complémentaires" )
        , ( keys.isCertificationPartial, Form.Checkbox "Le candidat a un objectif de certification partielle." )
        ]
    , saveLabel = "Envoyer le parcours"
    , title = "Définition du parcours"
    }
