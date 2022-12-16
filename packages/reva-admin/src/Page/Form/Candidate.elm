module Page.Form.Candidate exposing (..)

import Admin.Enum.Gender exposing (Gender(..))
import Data.Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Candidate
import Data.Form.Candidate
import Data.Form.Helper
import Data.Referential exposing (Referential)
import Dict exposing (Dict)
import Page.Form as Form exposing (Form)
import String exposing (String)


form : Dict String String -> ( Candidacy, Referential ) -> Form
form _ ( _, referential ) =
    let
        keys =
            Data.Form.Candidate.keys

        degrees =
            referential.degrees
                |> List.map (\d -> { id = d.id, label = d.longLabel })
                |> Data.Form.Helper.toIdList

        vulnerabilityIndicators =
            referential.vulnerabilityIndicators
                |> Data.Form.Helper.toIdList

        genders =
            [ Undisclosed
            , Man
            , Woman
            ]
                |> List.map (\el -> ( Data.Candidate.genderToString el, Data.Candidate.genderToString el ))
    in
    { elements =
        [ ( "heading", Form.Heading "1 - Informations candidat" )
        , ( keys.lastname, Form.Input "Nom" )
        , ( keys.firstname, Form.Input "Prénom" )
        , ( keys.firstname2, Form.Input "Prénom 2" )
        , ( keys.firstname3, Form.Input "Prénom 3" )
        , ( keys.gender, Form.Select "Genre" genders )
        , ( keys.highestDegree, Form.Select "Plus haut niveau de diplôme obtenu" degrees )
        , ( keys.vulnerabilityIndicator, Form.Select "Indicateur public fragile" vulnerabilityIndicators )
        ]
    , saveLabel = "Suivant"
    , title = "Demande de prise en charge"
    }
