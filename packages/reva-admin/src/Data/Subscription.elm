module Data.Subscription exposing (SubscriptionSummary, filterByWords)


type alias SubscriptionSummary =
    { id : String
    , accountLastname : String
    , accountFirstname : String
    , accountEmail : String
    , companyName : String
    , companyAddress : String
    }


filterByWords : String -> SubscriptionSummary -> Bool
filterByWords words candidacySummary =
    True
