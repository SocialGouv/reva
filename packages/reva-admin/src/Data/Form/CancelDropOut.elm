module Data.Form.CancelDropOut exposing (cancelDropOut, fromDict, keys, validate)

import Admin.Scalar exposing (Id(..))
import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (Referential)
import Dict exposing (Dict)


type alias CancelDropOut =
    {}


keys : {}
keys =
    {}


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( _, _ ) _ =
    Ok ()


fromDict : FormData -> CancelDropOut
fromDict _ =
    {}


cancelDropOut : Maybe Id -> List Data.Candidacy.CandidacyStatus -> Dict String String
cancelDropOut _ _ =
    [] |> Helper.toDict keys
