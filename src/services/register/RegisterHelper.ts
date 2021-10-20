import {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import slugify from 'slugify';
import {logger} from '@middlewares/log/Logger';
import {UserCreate, UserGet} from '@models/User';
import {AccountCreate, AccountGet, PaginatedAccountList} from '@models/Account';
import auth0Helper from '@middlewares/auth/Auth0Helper';
import {api} from '@utils/Api';


export default class RegisterHelper {

  private axiosInstance: AxiosInstance;
  private accountSvcAudience: string;

  createUser = async (user: UserCreate): Promise<UserGet> => {
    try {

      const token = await auth0Helper.getTokenForApi(this.accountSvcAudience);

      const options: AxiosRequestConfig = {
        method: 'POST',
        url: '/users',
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
        },
        data: {
          ...user,
        },
      };

      const response: AxiosResponse<UserGet> = await this.axiosInstance.request(options);
      const userGet: UserGet = response.data;
      return userGet;
    } catch (error) {
      logger.error('User Creation Failed.');
      logger.error(error);
      throw error;
    }
  };

  createAccount = async (account: AccountCreate): Promise<AccountGet> => {
    try {
      const token = await auth0Helper.getTokenForApi(this.accountSvcAudience);

      const options: AxiosRequestConfig = {
        method: 'POST',
        url: '/accounts',
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
        },
        data: {
          ...account,
        },
      };

      const response: AxiosResponse<AccountGet> = await this.axiosInstance.request(options);
      const accountGet: AccountGet = response.data;
      return accountGet;
    } catch (error) {
      logger.error('Account Creation Failed');
      logger.error(error);
      throw error;
    }
  };

  addUserToAccount = async (userId: string, accountId: string): Promise<void> => {
    try {

      const token = await auth0Helper.getTokenForApi(this.accountSvcAudience);

      // Get Etag first for PUT
      const headOptions: AxiosRequestConfig = {
        method: 'HEAD',
        url: `/account-users/${accountId}`,
        headers: {
          authorization: `Bearer ${token}`,
          'cache-control': 'no-cache',
        },
      };

      const headResponse = await this.axiosInstance.request(headOptions);
      const etag = headResponse.headers.etag;

      const options: AxiosRequestConfig = {
        method: 'PUT',
        url: `/account-users/${accountId}`,
        headers: {
          authorization: `Bearer ${token}`,
          'if-match': etag,
        },
        data: {
          users: [{user_id: userId}],
        },
      };
      await this.axiosInstance.request(options);
    } catch (error) {
      logger.error('Adding User to Account Failed');
      logger.error(error);
      throw error;
    }
  };

  generateHandle = (company_name: string, maxLength: number) => {
    let handle = company_name;

    // DOTO: move this to config
    const commonWords = ['company', 'companies', 'corporation', 'corp', 'corp.', 'inc.', 'service', 'services'];

    handle = handle.trim();

    // remove commonWords from company_name
    commonWords.forEach((word) => {
      const re = new RegExp(word, 'gi');
      handle = handle.replace(re, '');
    });

    handle = slugify(handle, {
      lower: true,
      strict: true,
    });

    if (handle.length <= maxLength) {
      if (handle.length < 5) {
        return `${handle}-store`;
      } else {
        return handle;
      }
    }

    // if maxLength index char is "-" then handle has full words
    if (handle.charAt(maxLength) === '-') {
      return handle.substr(0, maxLength);
    }

    // take maxLength chars then break at last "-" to get full words
    handle = handle.substr(0, maxLength);

    const lastIndex = handle.lastIndexOf('-');
    if (lastIndex !== -1) {
      handle = handle.substr(0, lastIndex);
      handle = handle.replace(/(-and)$/, '');
      if (handle.length < 5) { return `${handle}-store`; }
    }

    // this will be a broken single word
    // bad case only when first word is more than maxLength chars long
    return handle;

  };

  createUniqueHandle = async (company_name: string) => {

    let accounts; let index;
    let count = 0;

    let handle = this.generateHandle(company_name, 25);

    const token = await auth0Helper.getTokenForApi(this.accountSvcAudience);

    const options: AxiosRequestConfig = {
      method: 'GET',
      url: '/accounts',
      headers: {
        authorization: `Bearer ${token}`,
        'cache-control': 'no-cache',
      },
      params: {
        query: {
          handle,
        },
      },
    };

    // update handle till handle is unique
    try {
      // DOTO: We should change this, probably run it to configurable limit
      while (true) {
        const response: AxiosResponse<PaginatedAccountList> = await this.axiosInstance.request(options);

        accounts = response.data.accounts;

        if (accounts.length === 0) {
          return handle;
        } else {
          count += 1;
          if (count === 1) {
            handle += '-1';
          } else {
            index = handle.lastIndexOf('-');
            handle = handle.substr(0, index);
            handle += `-${count}`;
          }
        }
      }
    } catch (error) {
      logger.error('Creating Handle Failed');
      logger.error(error);
      throw error;
    }
  };

  constructor() {
     /* global process */
    if (!process.env.ACCOUNT_SERVICE_HOST || !process.env.ACCOUNT_SERVICE_AUD) {
      logger.error('Missing required details to initialize Register API');
      throw new Error('Missing required fields to initialize Register API');
    }
    this.axiosInstance = api(process.env.ACCOUNT_SERVICE_HOST);
    this.accountSvcAudience = process.env.ACCOUNT_SERVICE_AUD;
  }


}


