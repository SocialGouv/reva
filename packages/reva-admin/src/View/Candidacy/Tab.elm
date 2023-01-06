module View.Candidacy.Tab exposing (Tab(..))

import Data.Candidacy exposing (CandidacyId)


type Tab filters
    = CandidateInfo CandidacyId
    | DropOut CandidacyId
    | Empty filters
    | Meetings CandidacyId
    | Profil CandidacyId
    | Training CandidacyId
    | TrainingSent CandidacyId
    | Admissibility CandidacyId
    | FundingRequest CandidacyId
