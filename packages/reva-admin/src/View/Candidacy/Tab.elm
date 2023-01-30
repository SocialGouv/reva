module View.Candidacy.Tab exposing (Tab, Value(..))

import Data.Candidacy exposing (CandidacyId)


type alias Tab =
    { candidacyId : CandidacyId
    , value : Value
    }


type Value
    = Admissibility
    | CandidateInfo
    | DropOut
    | Meetings
    | PaymentRequest
    | PaymentUploads
    | Profile
    | Training
    | TrainingSent
    | FundingRequest
