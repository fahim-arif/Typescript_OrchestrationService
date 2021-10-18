import { InternalError } from '@utils/HttpException';
import { RegisterCreate } from '@models/Register';
import { UserCreate } from '@models/User';
import { AccountCreate } from '@models/Account';
import {createUser, createAccount, addUserToAccount, createUniqueHandle} from './registerhelper'

export default class RegisterService {

  constructor() {}

  async register(registerCreate : RegisterCreate ) : Promise<any> {
    try {
      const user: UserCreate = {
        name: registerCreate.name,
        email: registerCreate.email,
        password: registerCreate.password
      }

      const { id: userId } = await createUser(user);

      const handle = await createUniqueHandle(registerCreate.company_name);
      // console.log("Handle:", handle);
      
      const account: AccountCreate = {
        email: registerCreate.email,
        company_name: registerCreate.company_name,
        handle: handle
      }

      const { id: accountId } = await createAccount(account);

      await addUserToAccount(userId, accountId);

    } catch (error: any) {
      throw new InternalError(error.message);
    }
  }
}
