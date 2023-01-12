module View.Candidacy.Tab exposing (Tab(..))

import Data.Candidacy exposing (CandidacyId)


type Tab filters
    = Admissibility CandidacyId
    | CandidateInfo CandidacyId
    | DropOut CandidacyId
    | Empty filters
    | Meetings CandidacyId
    | PaymentRequest CandidacyId
    | Profil CandidacyId
    | Training CandidacyId
    | TrainingSent CandidacyId
    | FundingRequest CandidacyId
