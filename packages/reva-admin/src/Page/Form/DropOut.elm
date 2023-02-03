module Page.Form.DropOut exposing (..)

import Data.Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Form exposing (FormData)
import Data.Form.DropOut
import Data.Form.Helper
import Data.Referential exposing (Referential)
import Dict exposing (Dict)
import List.Extra
import Page.Form as Form exposing (Form)
import String exposing (String)


form : FormData -> ( Candidacy, Referential ) -> Form
form _ ( _, referential ) =
    let
        keys =
            Data.Form.DropOut.keys

        dropOutReasons =
            referential.dropOutReasons |> Data.Form.Helper.toIdList

        maybeDropOutOtherReasonValue =
            List.Extra.find (\reason -> reason.label == "Autre") referential.dropOutReasons
                |> Maybe.map .id
    in
    { elements =
        [ ( keys.dropOutReason, Form.Select "Quelle est la raison de l'abandon ?" dropOutReasons )
        , ( keys.otherReasonContent
          , maybeDropOutOtherReasonValue
                |> Maybe.map (\reason -> Form.SelectOther "dropOutReason" reason "Autre raison")
                |> Maybe.withDefault Form.Empty
          )
        , ( keys.droppedOutAt, Form.Date "Date" )
        ]
    , saveLabel = Nothing
    , submitLabel = "Enregistrer"
    , title = "Abandon du candidat"
    }
