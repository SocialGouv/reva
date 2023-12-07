module Page.Form.Training exposing (..)

import Accessibility exposing (Html, div, text)
import BetaGouv.DSFR.Button as Button
import Data.Candidacy exposing (Candidacy)
import Data.Context exposing (Context)
import Data.Form exposing (FormData)
import Data.Form.Helper
import Data.Form.Training exposing (scopeToString)
import Data.Referential exposing (Referential)
import Html.Attributes exposing (class)
import Page.Form as Form exposing (Form)
import Route


form : Context -> FormData -> ( Candidacy, Referential ) -> Form
form context _ ( candidacy, referential ) =
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
        [ ( "hours", Form.Title1 "Typologie et convention collective" )
        , ( "ccn", Form.StaticHtml (editCcn context candidacy) )
        , ( "hours", Form.Title1 "Nombre d'heures" )
        , ( keys.individualHourCount, Form.Number "Nombre d'heures d'accompagnement individuel" )
        , ( keys.collectiveHourCount, Form.Number "Nombre d'heures d'accompagnement collectif" )
        , ( keys.additionalHourCount, Form.Number "Nombre d’heures de formations complémentaires" )
        , ( "training", Form.Title1 "Compléments formatifs" )
        , ( keys.mandatoryTrainings
          , Form.CheckboxList "Formations obligatoires" <|
                Data.Form.Helper.toIdList referential.mandatoryTrainings
          )
        , ( keys.basicSkills
          , Form.CheckboxList "Savoirs de base" <|
                Data.Form.Helper.toIdList referential.basicSkills
          )
        , ( keys.certificateSkills, Form.Textarea "Blocs de compétences métier" (Just "RNCP25467BC03 - intitulé") )
        , ( keys.otherTraining, Form.Textarea "Autres actions de formation" Nothing )
        , ( keys.certificationScope
          , Form.RadioList "Le candidat / la candidate vise :" certificationScopes
          )
        ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer le parcours"
    , title = "Définition du parcours"
    }


editCcn : Context -> Candidacy -> Html msg
editCcn context candidacy =
    let
        ccnLabel =
            Maybe.map .label candidacy.conventionCollective
                |> Maybe.withDefault "Aucune convention collective sélectionnée"
    in
    div
        [ class "w-full -mt-2 mb-6"
        , class "flex justify-between items-end"
        , class "text-sm font-medium text-gray-500"
        ]
        [ text (candidacy.typology |> Data.Form.Training.candidateTypologyToString)
        , text " — "
        , text ccnLabel
        , text "."
        , Button.new { label = "Modifier", onClick = Nothing }
            |> Button.tertiary
            |> Button.small
            |> Button.withAttrs [ class "ml-12 fr-fi-edit-line fr-btn--icon-left" ]
            |> Button.linkButton (Route.toString context.baseUrl <| Route.Typology candidacy.id { page = 1 })
            |> Button.view
        ]
