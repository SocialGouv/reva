module Data.Certification exposing (Certification)


type alias Certification =
    { id : String
    , label : String
    , summary : String
    , acronym : String
    , level : Int
    , activities : Maybe String
    , activityArea : Maybe String
    , accessibleJobType : Maybe String
    , abilities : Maybe String

    --, codeRncp : String
    }
