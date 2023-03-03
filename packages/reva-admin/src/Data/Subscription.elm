module Data.Subscription exposing (SubscriptionSummary)


type alias SubscriptionSummary =
    { id : String
    , accountLastname : String
    , accountFirstname : String
    , accountEmail : String
    , companyName : String
    , companyAddress : String
    }
