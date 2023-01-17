module View.Candidacy.Tab exposing (Tab(..))

import Data.Candidacy exposing (CandidacyId)


type Tab
    = Admissibility CandidacyId
    | CandidateInfo CandidacyId
    | DropOut CandidacyId
    | Meetings CandidacyId
    | PaymentRequest CandidacyId
    | Profil CandidacyId
    | Training CandidacyId
    | TrainingSent CandidacyId
    | FundingRequest CandidacyId
