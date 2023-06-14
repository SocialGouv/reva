port module Window exposing (..)


port confirmRejection : { id : String, message : String } -> Cmd msg


port confirmValidation : { id : String, message : String } -> Cmd msg


port confirmedRejection : (( Bool, String ) -> msg) -> Sub msg


port confirmedValidation : (( Bool, String ) -> msg) -> Sub msg
