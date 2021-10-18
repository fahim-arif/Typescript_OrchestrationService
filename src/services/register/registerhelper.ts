import axios from 'axios'
import { AxiosResponse } from 'axios';
import slugify from 'slugify'
import { logger } from '@middlewares/log/Logger';
import { InternalError } from '@utils/HttpException';
import { UserCreate, UserGet } from '@models/User';
import { AccountCreate, AccountGet, PaginatedAccountList } from '@models/Account';
import { AccountUsersGet } from '@models/AccountUsers';
import { getToken } from '@utils/Auth0GetToken';


export async function createUser(user: UserCreate): Promise<UserGet> {
  try {
    const response: AxiosResponse<UserGet> = await axios.post(`${process.env.ACCOUNT_SERVICE_HOST}/users`, user);
    const userGet: UserGet = response.data
    return userGet; 
  } catch (error: any) {
    logger.error("user creation failed");
    throw new InternalError(error.message);
  }
}


export async function createAccount(account: AccountCreate): Promise<AccountGet> {
  try {
    const response: AxiosResponse<AccountGet>  = await axios.post(`${process.env.ACCOUNT_SERVICE_HOST}/accounts`, account);
    const accountGet: AccountGet = response.data
    return accountGet
  } catch (error: any) {
    logger.error("account creation failed");
    throw new InternalError(error.message);
  }
}


export async function addUserToAccount(userId: string, accountId: string): Promise<any> {
  try {
    const accountUsersGet: AccountUsersGet = await axios.put(`${process.env.ACCOUNT_SERVICE_HOST}/account-users/${accountId}`, {
      users: [{id: userId}]
    });
  } catch (error: any) {
    logger.error("adding user to account failed");
    throw new InternalError(error.message);
  }
}


export function generateHandle(company_name: string, maxLength: number) {
  let handle = company_name;

  let commonWords = ["company", "companies", "corporation", "corp", "corp.", "inc.", "service", "services"]

  handle = handle.trim()

  // remove commonWords from company_name
  commonWords.forEach(word => {
    let re = new RegExp(word, 'gi')
    handle = handle.replace(re, '')
  })

  handle = slugify(handle, {
    lower: true,
    strict: true   
  })
  
  if (handle.length <= maxLength) {
    if (handle.length < 5) return handle + '-store'
    else return handle
  }

  // if maxLength index char is "-" then handle has full words
  if (handle.charAt(maxLength) == "-") return handle.substr(0, maxLength)
  
  // take maxLength chars then break at last "-" to get full words
  handle = handle.substr(0, maxLength);
  
  let lastIndex = handle.lastIndexOf("-")
  if (lastIndex !== -1) {
    handle = handle.substr(0, lastIndex)
    handle = handle.replace(/(-and)$/, '')
    if (handle.length < 5) return handle + "-store"
  } 

  // this will be a broken single word
  // bad case only when first word is more than maxLength chars long
  return handle

}


export async function createUniqueHandle(company_name: string) {
    
  let accounts, index;
  let count = 0;

  let handle = generateHandle(company_name, 25)  

  const token = await getToken();

  const headers = { "authorization": `Bearer ${token}` }
    
  // update handle till handle is unique
  try {
    while (true) {
      let response: AxiosResponse<PaginatedAccountList> = await axios.get(
        `${process.env.ACCOUNT_SERVICE_HOST}/accounts?query[handle]=${handle}`,
        { headers: headers }
      );

      accounts = response.data.accounts
      
      if (accounts.length === 0) {
        return handle;
      } 
      else {
        count += 1
        if (count === 1) {
          handle += '-1'
        } else {
          index = handle.lastIndexOf('-')
          handle = handle.substr(0, index)
          handle += `-${count}`
        }
      }
    }
  } catch (error: any) {
    logger.error('creating handle failed')
    throw new InternalError(error.message);
  }
}