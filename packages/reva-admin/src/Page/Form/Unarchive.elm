module Page.Form.Unarchive exposing (..)

import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Unarchive
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)


form : FormData -> ( Candidacy, Referential ) -> Form
form formData ( _, referential ) =
  let 
    keys =
      Data.Form.Unarchive.keys
    unarchive =
        Data.Form.Unarchive.fromDict formData
  in
    { elements = []
    , saveLabel = Nothing
    , submitLabel = "Restaurer"
    , title = "Restaurer une candidature archivée"
    }
