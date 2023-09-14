module Data.CertificationAuthority exposing (CertificationAuthority)


type alias CertificationAuthority =
    { id : String
    , label : String
    , contactFullName : Maybe String
    , contactEmail : Maybe String
    }
