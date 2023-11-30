module Api.Token exposing (Token, anonymous, getEmail, init, isAdmin, isCertificationAuthority, isGestionnaireMaisonMereAAP, isOrganism, toString)


type Token
    = Token
        { isAdmin : Bool
        , isCertificationAuthority : Bool
        , isOrganism : Bool
        , isGestionnaireMaisonMereAAP : Bool
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


isGestionnaireMaisonMereAAP : Token -> Bool
isGestionnaireMaisonMereAAP (Token token) =
    token.isGestionnaireMaisonMereAAP


init : Bool -> Bool -> Bool -> Bool -> String -> String -> Token
init isAdminToken isCertificationAuthorityToken isOrganismToken isGestionnaireMaisonMereAAPToken email value =
    Token
        { isAdmin = isAdminToken
        , isCertificationAuthority = isCertificationAuthorityToken
        , isOrganism = isOrganismToken
        , isGestionnaireMaisonMereAAP = isGestionnaireMaisonMereAAPToken
        , email = email
        , value = value
        }


anonymous : Token
anonymous =
    Token
        { isAdmin = False
        , isCertificationAuthority = False
        , isOrganism = False
        , isGestionnaireMaisonMereAAP = False
        , email = ""
        , value = "anonymous"
        }
