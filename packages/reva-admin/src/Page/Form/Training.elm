module Page.Form.Training exposing (..)

import Admin.Enum.CandidateTypology exposing (CandidateTypology(..))
import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Helper
import Data.Form.Training exposing (scopeToString)
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( _, referential ) =
    let
        keys =
            Data.Form.Training.keys

        certificationScopes =
            [ ( "full", Data.Form.Training.Full )
            , ( "partial", Data.Form.Training.Partial )
            ]
                |> List.map (\( id, scope ) -> ( id, scopeToString scope ))
    in
    { elements =
        [ ( "hours", Form.Title1 "2 - Nombre d'heures" )
        , ( "companion", Form.Title2 "Accompagnement" )
        , ( keys.individualHourCount, Form.Number "Nombre d'heures d'accompagnement individuel" )
        , ( keys.collectiveHourCount, Form.Number "Nombre d'heures d'accompagnement collectif" )
        , ( "training-hours", Form.Title2 "Formations complémentaires" )
        , ( keys.additionalHourCount, Form.Number "Nombre d'heures" )
        , ( "training", Form.Title1 "3 - Compléments formatifs" )
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
        , ( keys.certificationScope
          , Form.RadioList "Le candidat / la candidate vise :" certificationScopes
          )
        ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer le parcours"
    , title = "Définition du parcours"
    }
