module Page.Form.PaymentUploadsAndConfirmationUniFvae exposing (..)

import Accessibility exposing (div)
import BetaGouv.DSFR.Button as Button
import BetaGouv.DSFR.Icons.System as Icons
import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.PaymentUploadsAndConfirmationUniFvae
import Data.Referential exposing (Referential)
import Html exposing (Html, p, span, text)
import Html.Attributes exposing (class)
import Page.Form as Form exposing (Form)
import Route
import View


keys =
    Data.Form.PaymentUploadsAndConfirmationUniFvae.keys


form : { backUrl : String } -> FormData -> ( Candidacy, Referential ) -> Form
form config _ ( _, _ ) =
    { elements =
        [ ( "stepper"
          , Form.StaticHtml <|
                View.stepper
                    { currentStep = 2
                    , totalSteps = 2
                    , currentTitle = "Déposez les pièces justificicatives"
                    , nextTitle = Nothing
                    }
          )
        , ( "files-heading", Form.Title1 "1 - Pièces jointes liées à la facturation" )
        , ( "invoiceFile", Form.Title2 "Joindre la facture" )
        , ( keys.invoiceFiles, Form.File "La facture doit être net de TVA et doit contenir un RIB." "Taille maximale : 10 Mo. Format supporté : pdf." )
        , ( "certificateFile", Form.Title2 "Joindre un récapitulatif des attestations de présence" )
        , ( keys.certificateOfAttendanceFiles, Form.File "Le document doit comprendre l’ensemble des attestations d’accompagnement individuel, collectif et formatif du candidat." "Taille maximale : 10 Mo. Format supporté : pdf." )
        , ( "confirmation-heading", Form.Title1 "2 - Confirmation" )
        , ( "confirmation-warning"
          , Form.StaticHtml <|
                View.alert View.Warning
                    [ class "mt-2 mb-10" ]
                    "Confirmation avant envoi du dossier de demande de paiement"
                    [ p []
                        [ span []
                            [ text "Avant de procéder à l’envoi des pièces, veillez à bien vérifier que celles-ci sont les bonnes et que le dossier est complet."
                            ]
                        ]
                    ]
          )
        , ( "confirmation-checks-heading", Form.Title2 "Avant de finaliser votre envoi :" )
        , ( keys.confirmationCheckPart1
          , Form.Checkbox "Je confirme le montant de paiement. Je ne pourrai pas modifier cette demande de paiement après son envoi."
          )
        , ( keys.confirmationCheckPart2
          , Form.Checkbox "J’ai bien vérifié que le dossier de demande de paiement était correct et complet."
          )
        , ( keys.confirmationCheckPart3
          , Form.Checkbox "J’ai bien vérifié que j’avais ajouté les différentes pièces justificatives nécessaires et qu’elles étaient correctes et complètes."
          )
        , ( "", Form.BreakToplevel )
        , ( "previous"
          , Form.StaticHtml <|
                div
                    [ class "-mb-8" ]
                    [ Button.new { onClick = Nothing, label = "Étape précédente" }
                        |> Button.linkButton config.backUrl
                        |> Button.secondary
                        |> Button.view
                    ]
          )
        ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer la demande de paiement"
    , title = "Demande de paiement"
    }
