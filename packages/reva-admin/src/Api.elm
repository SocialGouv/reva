module Api exposing (Token, anonymous, hasAdminToken, initToken, tokenToString)


type Token
    = Token Bool String


tokenToString : Token -> String
tokenToString (Token _ token) =
    token


hasAdminToken : Token -> Bool
hasAdminToken (Token isAdmin _) =
    isAdmin


initToken : Bool -> String -> Token
initToken isAdmin token =
    Token isAdmin token


anonymous : Token
anonymous =
    Token False "anonymous"
