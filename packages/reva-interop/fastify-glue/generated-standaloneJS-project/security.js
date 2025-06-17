// implementation of the security schemes in the openapi specification

export class Security {
	async initialize(schemes) {
		// schemes will contain securitySchemes as found in the openapi specification
		console.log("Initialize:", JSON.stringify(schemes));
	}

	// Security scheme: jwt_bearer_token
	// Type: http
	async jwt_bearer_token(req, reply, params) {
		console.log("jwt_bearer_token: Authenticating request");
		// If validation fails: throw new Error('Could not authenticate request')
		// Else, simply return.

		// The request object can also be mutated here (e.g. to set 'req.user')
	}
}
