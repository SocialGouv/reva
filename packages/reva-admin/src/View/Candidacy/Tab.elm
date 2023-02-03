module View.Candidacy.Tab exposing (Tab, Value(..))

import Data.Candidacy exposing (CandidacyId)


type alias Tab =
    { candidacyId : CandidacyId
    , value : Value
    }


type Value
    = Admissibility
    | Archive
    | CandidateInfo
    | DropOut
    | Meetings
    | PaymentRequest
    | PaymentRequestConfirmation
    | PaymentUploads
    | Profile
    | Training
    | TrainingSent
    | FundingRequest
