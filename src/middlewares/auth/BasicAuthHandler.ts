import * as basicAuth from 'express-basic-auth';

function basicAuthrorizer(username:string, password:string) : boolean {
  /* global process */
  if (!process.env.BASIC_AUTH_USER || !process.env.BASIC_AUTH_PASS) {
    return false;
  }
  const userMatches = basicAuth.safeCompare(username, process.env.BASIC_AUTH_USER);
  const passwordMatches = basicAuth.safeCompare(password, process.env.BASIC_AUTH_PASS);

  return userMatches && passwordMatches;
}


const basicAuthHandler = basicAuth.default({authorizer: basicAuthrorizer, challenge: true, realm: 'twomatches'});

export default basicAuthHandler;
