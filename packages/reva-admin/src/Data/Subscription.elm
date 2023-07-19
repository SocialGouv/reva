module Data.Subscription exposing (Subscription, SubscriptionSummary, SubscriptionSummaryPage)

import Admin.Enum.LegalStatus exposing (LegalStatus)
import Admin.Enum.SubscriptionOrganismTypology exposing (SubscriptionOrganismTypology)
import Admin.Enum.SubscriptionRequestStatus exposing (SubscriptionRequestStatus)
import Data.Pagination exposing (PaginationInfo)
import Data.Referential exposing (ConventionCollective, DepartmentWithOrganismMethods, Domain)
import Data.Scalar exposing (Timestamp)


type alias SubscriptionSummaryPage =
    { rows : List SubscriptionSummary
    , info : PaginationInfo
    }


type alias SubscriptionSummary =
    { id : String
    , accountLastname : String
    , accountFirstname : String
    , accountEmail : String
    , companyName : String
    , companyAddress : String
    , createdAt : Timestamp
    }


type alias Subscription =
    { id : String
    , companySiret : String
    , companyLegalStatus : LegalStatus
    , companyName : String
    , companyAddress : String
    , companyZipCode : String
    , companyCity : String
    , companyWebsite : Maybe String
    , accountFirstname : String
    , accountLastname : String
    , accountEmail : String
    , accountPhoneNumber : String
    , typology : SubscriptionOrganismTypology
    , domains : List Domain
    , ccns : List ConventionCollective
    , departmentsWithOrganismMethods : List DepartmentWithOrganismMethods
    , qualiopiCertificateExpiresAt : Timestamp
    , status : SubscriptionRequestStatus
    , rejectionReaseon : Maybe String
    , isCompanyNameUnique : Bool
    }
