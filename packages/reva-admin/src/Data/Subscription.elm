module Data.Subscription exposing (SubscriptionSummary, filterByWords)

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


filterByWords : String -> SubscriptionSummary -> Bool
filterByWords words candidacySummary =
    True
