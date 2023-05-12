module Data.Subscription exposing (Subscription, SubscriptionSummary, filterByWords)

import Admin.Enum.LegalStatus exposing (LegalStatus)
import Admin.Enum.OrganismTypology exposing (OrganismTypology)
import Data.Referential exposing (ConventionCollective, Department, DepartmentWithOrganismMethods, Domain)
import Data.Scalar exposing (Timestamp)


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
    , companyBillingContactFirstname : String
    , companyBillingContactLastname : String
    , companyBillingEmail : String
    , companyBillingPhoneNumber : String
    , companyBic : String
    , companyIban : String
    , companyWebsite : Maybe String
    , accountFirstname : String
    , accountLastname : String
    , accountEmail : String
    , accountPhoneNumber : String
    , typology : OrganismTypology
    , domains : List Domain
    , ccns : List ConventionCollective
    , departmentsWithOrganismMethods : List DepartmentWithOrganismMethods
    }


filterByWords : String -> SubscriptionSummary -> Bool
filterByWords words candidacySummary =
    True
