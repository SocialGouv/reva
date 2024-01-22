module Page.Form.DossierDeValidation exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.DossierDeValidation
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( candidacy, _ ) =
    let
        keys =
            Data.Form.DossierDeValidation.keys
    in
    { elements =
        [ ( ""
          , Form.Text "Le dossier de validation doit être rédigé par le candidat.Des pièces jointes supplémentaires peuvent être ajoutées selon les attendus du certificateur." Nothing
          )
        , ( keys.dossierDeValidationFile, Form.FileRequired "Joindre le dossier de validation" "Format supporté : PDF uniquement avec un poids maximum de 2Mo" )
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = "Dossier de validation"
    }
