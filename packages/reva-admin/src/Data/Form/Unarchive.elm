module Data.Form.Unarchive exposing (fromDict, keys, unarchive, validate)

import Admin.Scalar exposing (Id(..))
import Data.Candidacy exposing (Candidacy)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (Referential)
import Dict exposing (Dict)


type alias Unarchive =
    {}


keys : {}
keys =
    {}


validate : ( Candidacy, Referential ) -> FormData -> Result String ()
validate ( _, _ ) _ =
    Ok ()


fromDict : FormData -> Unarchive
fromDict _ =
    {}


unarchive : Maybe Id -> List Data.Candidacy.CandidacyStatus -> Dict String String
unarchive _ _ =
    [] |> Helper.toDict keys
