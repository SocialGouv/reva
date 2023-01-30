module Page.Form.PaymentUploads exposing (..)

import Data.Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Form exposing (FormData)
import Data.Form.PaymentUploads
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


keys =
    Data.Form.PaymentUploads.keys


form : FormData -> ( Candidacy, Referential ) -> Form
form formData ( _, _ ) =
    { elements =
        [ ( "heading", Form.Heading "2 - Pièces à joindre" )
        , ( keys.invoiceFiles, Form.File "Facture" )
        , ( "invoiceFilesHelp"
          , Form.Requirements "La facture doit faire apparaître les éléments suivants :"
                [ "Nom de la structure prestataire (accompagnement, organisme de formation)"
                , "Numéro de convention de prise en charge d'Uniformation"
                , "Nombre d'heures réalisées en accompagnement individuel et collectif, actes formatifs, jury et post jury"
                , "Total demandé et total réalisé"
                ]
          )
        , ( keys.appointmentFiles, Form.File "Récapitulatif des attestations de présence" )
        ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer"
    , title = "Demande de paiement"
    }
