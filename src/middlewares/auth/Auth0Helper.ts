import {AxiosResponse} from 'axios';
import {logger} from '@middlewares/log/Logger';
import {api} from '@utils/Api';

type TokenHolder = {
  token: string;
  tokenExpirationTime : number;
}

class Auth0Helper {

  private tokenMap: Map<string, TokenHolder>;
  private baseUrl: string;
  private client_id: string;
  private client_secret: string;
  private grant_type: string;

  getTokenForApi = async (audience: string) => {

    // Get Token for this Audience or api
    const tokenHolder = this.tokenMap.get(audience);

    // If the token is about to expire or expired get a new one else use existing token
    if (tokenHolder && (tokenHolder.tokenExpirationTime > new Date().getTime()) && tokenHolder.token) {
      logger.debug('Token is still valid , reusing existing token');
      return tokenHolder.token;
    }

    try {
      logger.debug('Token expired , fetching new one from management api');
      const axiosInstance = api(this.baseUrl);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response : AxiosResponse<any> = await axiosInstance({
        method: 'post',
        url: '/oauth/token',
        data: {client_id: this.client_id,
          client_secret: this.client_secret,
          audience,
          grant_type: this.grant_type},

      });

      const token = response.data.access_token;
      const token_window : number = parseInt(process.env.TOKEN_WINDOW || '1439', 10);
      const tokenExpirationTime = new Date().getTime() + (token_window * 60000);
      const responseToken: TokenHolder = {
        token,
        tokenExpirationTime,
      };

      this.tokenMap.set(audience, responseToken);
      return token;
    } catch (error) {
      logger.error('Failed to get token for management endpoint');
      logger.error(error);
      throw error;
    }
  };

  constructor() {
  /* global process */
    if (!process.env.AUTH0_BASE_URL || !process.env.ORCH_CLIENT_ID || !process.env.ORCH_CLIENT_SECRET ||
      !process.env.AUTH0_GRANT_TYPE) {
      logger.error('Missing required details to initialize Auth0Helper API');
      throw new Error('Missing required fields to initialize Auth0Helper API');
    }

    this.baseUrl = process.env.AUTH0_BASE_URL;
    this.client_id = process.env.ORCH_CLIENT_ID;
    this.client_secret = process.env.ORCH_CLIENT_SECRET;
    this.grant_type = process.env.AUTH0_GRANT_TYPE;
    this.tokenMap = new Map();

  }


}

const auth0Helper = new Auth0Helper();
export default auth0Helper;
