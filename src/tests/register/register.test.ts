import {AccountCreate, AccountGet} from '@models/Account';
import {UserCreate, UserGet} from '@models/User';
import RegisterHelper from '@services/register/RegisterHelper';

const axios = require('axios').default;

jest.mock('axios');

describe('register', () => {

  it('creates new user', async () => {

    const user: UserCreate = {
      name: 'John',
      email: 'john@example.com',
      password: 'aA2@abcabc',
      receive_notifications: true,
    };

    const responseData: UserGet = {
      id: 'random-user-id',
      name: 'John',
      email: 'john@example.com',
      password: 'aA2@abcabc',
      receive_notifications: true,
    };

    axios.post.mockResolvedValue({data: responseData});
    // axios.post.mockImplementation(() => { return { data: responseData }});

    const registerHelper = new RegisterHelper();
    const userGet: UserGet = await registerHelper.createUser(user);

    expect(userGet).toEqual(responseData);
    expect(userGet.id).toEqual('random-user-id');
  });


  it('creates new account', async () => {

    const account: AccountCreate = {
      email: 'john@example.com',
      company_name: 'Apple',
      handle: 'apple',
    };

    const responseData: AccountGet = {
      id: 'random-user-id',
      email: 'john@example.com',
      company_name: 'Apple',
      handle: 'apple',
    };

    axios.post.mockResolvedValue({data: responseData});

    const registerHelper = new RegisterHelper();
    const accountGet: AccountGet = await registerHelper.createAccount(account);

    expect(accountGet).toEqual(responseData);
    expect(accountGet.id).toEqual('random-user-id');
  });

});


