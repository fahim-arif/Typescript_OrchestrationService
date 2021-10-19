import {InternalError} from '@utils/HttpException';
import {RegisterCreate} from '@models/Register';
import {UserCreate} from '@models/User';
import {AccountCreate} from '@models/Account';
import {logger} from '@middlewares/log/Logger';
import RegisterHelper from '@services/register/RegisterHelper';

export default class RegisterService {

  private registerHelper : RegisterHelper;

  constructor() {
    this.registerHelper = new RegisterHelper();
  }

  async register(registerCreate : RegisterCreate) : Promise<void> {
    try {
      const user: UserCreate = {
        name: registerCreate.name,
        email: registerCreate.email,
        password: registerCreate.password,
      };

      const {id: userId} = await this.registerHelper.createUser(user);

      const handle = await this.registerHelper.createUniqueHandle(registerCreate.company_name);

      const account: AccountCreate = {
        email: registerCreate.email,
        company_name: registerCreate.company_name,
        handle,
      };

      const {id: accountId} = await this.registerHelper.createAccount(account);

      await this.registerHelper.addUserToAccount(userId, accountId);

    } catch (error) {
      logger.error(`Registration of user with email ${registerCreate.email} and name ${registerCreate.name} failed. Please take steps to clean the data if needed.`);
      throw new InternalError(error.message);
    }
  }
}
