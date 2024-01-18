module Data.Form.ReadyForJuryEstimatedDate exposing (EstimatedDate, estimatedDate, estimatedDateFromDict, keys, validate)

import Data.Candidacy exposing (Candidacy, CandidacyId)
import Data.Form exposing (FormData)
import Data.Form.Helper as Helper
import Data.Referential exposing (Referential)
import Data.Scalar
import Dict exposing (Dict)
import Time


type alias EstimatedDate =
    { candidacyId : CandidacyId
    , estimatedDate : Data.Scalar.Timestamp
    }


keys =
    { estimatedDate = "estimatedDate" }


estimatedDateFromDict : FormData -> Data.Scalar.Timestamp
estimatedDateFromDict formData =
    let
        decode =
            Helper.decode keys formData
    in
    decode.date .estimatedDate (Time.millisToPosix 0)


estimatedDate : Maybe Data.Scalar.Timestamp -> Dict String String
estimatedDate date =
    [ ( .estimatedDate, Maybe.map Helper.dateToString date ) ]
        |> Helper.toDict keys


validate : ( Candidacy, Referential ) -> FormData -> Result (List String) ()
validate ( _, _ ) formData =
    let
        decode =
            Helper.decode keys formData
    in
    case decode.maybe.date .estimatedDate Nothing of
        Nothing ->
            Err [ "Veuillez saisir une date prévisionnelle" ]

        _ ->
            Ok ()
