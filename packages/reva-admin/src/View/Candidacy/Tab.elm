module View.Candidacy.Tab exposing (Tab(..))

import Data.Candidacy exposing (CandidacyId)


type Tab
    = CandidateInfo CandidacyId
    | DropOut CandidacyId
    | Empty
    | Meetings CandidacyId
    | Profil CandidacyId
    | Training CandidacyId
    | TrainingSent CandidacyId
    | Admissibility CandidacyId
    | FundingRequest CandidacyId
