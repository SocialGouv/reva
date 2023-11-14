module Data.Form.PaymentUploadsAndConfirmationUniFvae exposing (keys, validateConfirmation)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (Referential)
import Route exposing (Route(..))


keys =
    { invoiceFiles = "invoiceFiles"
    , certificateOfAttendanceFiles = "certificateOfAttendanceFiles"
    , confirmationCheckPart1 = "confirmationCheckPart1"
    , confirmationCheckPart2 = "confirmationCheckPart2"
    , confirmationCheckPart3 = "confirmationCheckPart3"
    }


validateConfirmation : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validateConfirmation ( _, _ ) formData =
    let
        decode =
            Helper.decode keys formData

        confirmationCheck1 =
            decode.bool .confirmationCheckPart1 False

        confirmationCheck2 =
            decode.bool .confirmationCheckPart2 False

        confirmationCheck3 =
            decode.bool .confirmationCheckPart3 False
    in
    if not (confirmationCheck1 && confirmationCheck2 && confirmationCheck3) then
        Err [ "Veuillez cocher toutes les cases" ]

    else
        Ok ()
