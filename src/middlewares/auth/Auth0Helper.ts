import {AxiosResponse} from 'axios';
import {logger} from '@middlewares/log/Logger';
import {api} from '@utils/Api';
import TokenRepository from '@repositories/token/TokenRepository';
import {NotFound} from '@utils/HttpException';
import {Auth0Token} from '@models/Token';


class Auth0Helper {

  private tokenMap: Map<string, Auth0Token>;
  private baseUrl: string;
  private client_id: string;
  private client_secret: string;
  private grant_type: string;
  private tokenRepository: TokenRepository;

  private getTokenData = async (audience:string) : Promise<Auth0Token> => {

    try {
      let tokenHolder = this.tokenMap.get(audience);
      if (!tokenHolder) {
        const apiToken = await this.tokenRepository.findByAudience(audience);
        tokenHolder = apiToken.token_data;
        this.tokenMap.set(audience, tokenHolder);
      }
      return tokenHolder;
    } catch (error) {
      logger.error(error);
      throw error;
    }

  };


  private updateTokenData = async (audience: string, token_data: Auth0Token) => {
    try {
      await this.tokenRepository.updateByAudience(audience, token_data);
      this.tokenMap.set(audience, token_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  };

  getTokenForApi = async (audience: string) : Promise<string> => {

    try {
    // Get Token for this Audience or api
      let tokenHolder;
      try {
        tokenHolder = await this.getTokenData(audience);
      } catch (error) {
        if (error instanceof NotFound) {
          logger.info(`Token for audience - ${audience} not found in DB or Map.Calling Auth0 API to get token`);
        } else {
          throw error;
        }
      }

    // If the token is about to expire or expired get a new one else use existing token
      if (tokenHolder && (tokenHolder.tokenExpirationTime > new Date().getTime()) && tokenHolder.access_token) {
        logger.debug('Token is still valid , reusing existing token');
        return tokenHolder.access_token;
      }


      logger.debug('Token expired , fetching new one from Auth0 api');
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

      tokenHolder = response.data as Auth0Token;
      const token_window : number = tokenHolder?.expires_in || 86400;
      // Set Token expiration 60 seconds before the actual expires_in time
      tokenHolder.tokenExpirationTime = new Date().getTime() + ((token_window - 60) * 1000);
      // update the token in map and db
      this.tokenMap.set(audience, tokenHolder);
      this.updateTokenData(audience, tokenHolder);
      return tokenHolder.access_token;
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
    this.tokenRepository = new TokenRepository();

  }


}

const auth0Helper = new Auth0Helper();
export default auth0Helper;
