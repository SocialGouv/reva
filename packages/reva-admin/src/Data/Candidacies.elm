module Data.Candidacies exposing (Candidacies, RemoteCandidacies)

import Data.CandidacySummary exposing (CandidacySummary)
import Graphql.Http
import RemoteData exposing (RemoteData)


type alias Candidacies =
    List CandidacySummary


type alias RemoteCandidacies =
    RemoteData (Graphql.Http.Error (List CandidacySummary)) Candidacies
