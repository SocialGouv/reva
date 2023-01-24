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
        , ( keys.invoiceFiles, Form.Files "Facture" )
        , ( keys.appointmentFiles, Form.Files "Récapitulatif des attestations de présence" )
        ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer"
    , title = "Demande de paiement"
    }
