module Api.Token exposing (Token, anonymous, init, isAdmin, toString)


type Token
    = Token Bool String


toString : Token -> String
toString (Token _ token) =
    token


isAdmin : Token -> Bool
isAdmin (Token isAdminToken _) =
    isAdminToken


init : Bool -> String -> Token
init isAdminToken token =
    Token isAdminToken token


anonymous : Token
anonymous =
    Token False "anonymous"
