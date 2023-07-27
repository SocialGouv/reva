module Api.Token exposing (Token, anonymous, init, isAdmin, isCertificationAuthority, isOrganism, toString)


type Token
    = Token
        { isAdmin : Bool
        , isCertificationAuthority : Bool
        , isOrganism : Bool
        , value : String
        }


toString : Token -> String
toString (Token token) =
    token.value


isAdmin : Token -> Bool
isAdmin (Token token) =
    token.isAdmin


isCertificationAuthority : Token -> Bool
isCertificationAuthority (Token token) =
    token.isCertificationAuthority


isOrganism : Token -> Bool
isOrganism (Token token) =
    token.isOrganism


init : Bool -> Bool -> Bool -> String -> Token
init isAdminToken isCertificationAuthorityToken isOrganismToken value =
    Token
        { isAdmin = isAdminToken
        , isCertificationAuthority = isCertificationAuthorityToken
        , isOrganism = isOrganismToken
        , value = value
        }


anonymous : Token
anonymous =
    Token
        { isAdmin = False
        , isCertificationAuthority = False
        , isOrganism = False
        , value = "anonymous"
        }
