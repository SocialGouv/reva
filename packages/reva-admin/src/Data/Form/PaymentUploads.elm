module Data.Form.PaymentUploads exposing
    ( PaymentUploadsInput
    , fromDict
    , keys
    , validate
    )

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (BasicSkill, MandatoryTraining, Referential)


type alias PaymentUploadsInput =
    {}


keys =
    { invoiceFiles = "invoiceFiles"
    , appointmentFiles = "appointmentFiles"
    }


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( candidacy, _ ) formData =
    Ok ()


fromDict : FormData -> PaymentUploadsInput
fromDict formData =
    let
        decode =
            Helper.decode keys formData
    in
    PaymentUploadsInput
