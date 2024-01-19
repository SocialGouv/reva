module View.Candidacy.Tab exposing (Tab, Value(..))

import Data.Candidacy exposing (CandidacyId)


type alias Tab =
    { candidacyId : CandidacyId
    , value : Value
    }


type Value
    = Admissibility
    | Archive
    | Unarchive
    | DropOut
    | CancelDropOut
    | Meetings
    | ReadyForJuryEstimatedDate
    | DossierDeValidation
    | PaymentRequest
    | PaymentRequestConfirmation
    | PaymentUploads
    | Profile
    | Training
    | TrainingSent
    | FundingRequest
    | ExamInfo
    | Feasibility
