module Api.Token exposing (Token, anonymous, getEmail, init, isAdmin, isCertificationAuthority, isOrganism, toString)


type Token
    = Token
        { isAdmin : Bool
        , isCertificationAuthority : Bool
        , isOrganism : Bool
        , email : String
        , value : String
        }


toString : Token -> String
toString (Token token) =
    token.value


getEmail : Token -> String
getEmail (Token token) =
    token.email


isAdmin : Token -> Bool
isAdmin (Token token) =
    token.isAdmin


isCertificationAuthority : Token -> Bool
isCertificationAuthority (Token token) =
    token.isCertificationAuthority


isOrganism : Token -> Bool
isOrganism (Token token) =
    token.isOrganism


init : Bool -> Bool -> Bool -> String -> String -> Token
init isAdminToken isCertificationAuthorityToken isOrganismToken email value =
    Token
        { isAdmin = isAdminToken
        , isCertificationAuthority = isCertificationAuthorityToken
        , isOrganism = isOrganismToken
        , email = email
        , value = value
        }


anonymous : Token
anonymous =
    Token
        { isAdmin = False
        , isCertificationAuthority = False
        , isOrganism = False
        , email = ""
        , value = "anonymous"
        }
