module Page.Form.FundingRequestUniFvae exposing (form)

import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import Data.Candidacy as Candidacy exposing (Candidacy, CandidacyId, CandidacySummary)
import Data.Certification exposing (Certification)
import Data.Form exposing (FormData)
import Data.Referential exposing (Referential)
import Page.Form as Form exposing (Form)
import String exposing (String)


form : Maybe Certification -> FormData -> ( Candidacy, Referential ) -> Form
form maybeCertification formData ( candidacy, referential ) =
    { elements = []
    , saveLabel = Nothing
    , submitLabel = "Envoyer"
    , title = "Demande de prise en charge"
    }
