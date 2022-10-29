module Api exposing (Token, anonymous, stringToToken, tokenToString)


type Token
    = Token String


tokenToString : Token -> String
tokenToString (Token token) =
    token


stringToToken : String -> Token
stringToToken token =
    Token token


anonymous : Token
anonymous =
    Token "anonymous"
