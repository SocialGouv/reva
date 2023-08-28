module Page.Form.Training exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Helper
import Data.Form.Training
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( _, referential ) =
    let
        keys =
            Data.Form.Training.keys
    in
    { elements =
        [ ( "hours", Form.Title1 "1 - Nombre d'heures" )
        , ( "companion", Form.Title2 "Accompagnement" )
        , ( keys.individualHourCount, Form.Number "Nombre d'heures d'accompagnement individuel" )
        , ( keys.collectiveHourCount, Form.Number "Nombre d'heures d'accompagnement collectif" )
        , ( "training-hours", Form.Title2 "Formations complémentaires" )
        , ( keys.additionalHourCount, Form.Number "Nombre d'heures" )
        , ( "training", Form.Title1 "2 - Compléments formatifs" )
        , ( keys.mandatoryTrainings
          , Form.CheckboxList "Formations obligatoires" <|
                Data.Form.Helper.toIdList referential.mandatoryTrainings
          )
        , ( keys.basicSkills
          , Form.CheckboxList "Savoirs de base" <|
                Data.Form.Helper.toIdList referential.basicSkills
          )
        , ( keys.certificateSkills, Form.Textarea "Blocs de compétences métier" (Just "RNCP25467BC03 - intitulé") )
        , ( keys.otherTraining, Form.Textarea "Autres actions de formations complémentaires" Nothing )
        , ( keys.isCertificationPartial, Form.Checkbox "Le candidat vise un ou plusieurs blocs de compétences." )
        ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer le parcours"
    , title = "Définition du parcours"
    }
