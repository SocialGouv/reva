module Page.Form.PaymentUploads exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.PaymentUploads
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


keys =
    Data.Form.PaymentUploads.keys


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( _, _ ) =
    { elements =
        [ ( "files-heading", Form.Heading "2 - Documents" )
        , ( "other-help-heading", Form.Section "Pièces justificatives à joindre" )
        , ( "invoice-files-help"
          , Form.Requirements "La facture doit faire apparaître les éléments suivants :"
                [ "Nom de la structure prestataire (accompagnement, organisme de formation)"
                , "Numéro de convention de prise en charge d'Uniformation"
                , "Nombre d'heures réalisées en accompagnement individuel et collectif, actes formatifs, jury et post jury"
                , "Total demandé et total réalisé"
                ]
          )
        , ( keys.invoiceFiles, Form.File "Ajouter une facture" "Taille maximale : 10 Mo. Format supporté : pdf." )
        , ( keys.appointmentFiles, Form.File "Ajouter un récapitulatif des attestations de présence" "Taille maximale : 10 Mo. Format supporté : pdf." )
        , ( "other-help-heading", Form.Section "Pièces justificatives à conserver" )
        , ( "other-help"
          , Form.Requirements "Pièces justificatives que vous devez collecter et conserver pendant 5 ans, en cas de contrôle à posteriori de l'OPCO de la Cohésion :"
                [ "Avis de recevabilité transmis par le certificateur"
                , "Relevé d'assiduité du candidat par prestation (récapitulatif du nombre d'heures de présence par prestataire)"
                , "Résultat du jury dans le cas d'une demande d'heure d'accompagnement post-Jury"
                , """Justificatif situation "public fragile" (ce justificatif, demandé au moment du paiement seulement, entérine la calcul de prise en charge ainsi que le règlement)"""
                , "Copie RQTH (ou renouvellement en cours)"
                , "Justificatif du bénéfice de minima sociaux (ASS, RSA, AAH)"
                , "Justificatif demandeurs d'emploi + 12 mois"
                , "Justificatif du plus haut niveau de diplôme obtenu"
                ]
          )
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = "Demande de paiement"
    }
