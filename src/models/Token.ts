export interface Auth0Token {
  access_token: string;
  token_type: string;
  expires_in : number;
  tokenExpirationTime : number
}


export interface ApiToken {
  audience: string;
  token_data: Auth0Token;
}
