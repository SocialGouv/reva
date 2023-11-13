module Page.Form.PaymentUploadsAndConfirmationUniFvae exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.PaymentUploadsAndConfirmationUniFvae
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


keys =
    Data.Form.PaymentUploadsAndConfirmationUniFvae.keys


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( _, _ ) =
    { elements =
        [ ( "files-heading", Form.Title1 "1 - Pièces jointes liées à la facturation" )
        , ( keys.invoiceFiles, Form.File "Ajouter une facture" "Taille maximale : 10 Mo. Format supporté : pdf." )
        , ( keys.certificateOfAttendanceFiles, Form.File "Ajouter un récapitulatif des attestations de présence" "Taille maximale : 10 Mo. Format supporté : pdf." )
        ]
    , saveLabel = Nothing
    , submitLabel = "Envoyer"
    , title = "Demande de paiement"
    }
