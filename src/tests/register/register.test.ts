import { AccountCreate, AccountGet } from "@root/models/Account";
import { UserCreate, UserGet } from "@root/models/User";
import {createUser, createAccount } from '@services/register/registerhelper'

var axios = require('axios').default;

jest.mock("axios");

describe('register', () => {

  it("creates new user", async () => {
  
    const user: UserCreate = {
      name: "John",
      email: "john@example.com",
      password: "aA2@abcabc",
    };
  
    const responseData: UserGet = {
      id: "random-user-id",
      name: "John",
      email: "john@example.com",
      password: "aA2@abcabc",
    };
    
    axios.post.mockResolvedValue({ data: responseData });
    // axios.post.mockImplementation(() => { return { data: responseData }});
  
    const userGet: UserGet = await createUser(user);
  
    expect(userGet).toEqual(responseData);
    expect(userGet.id).toEqual("random-user-id");
  });


  it("creates new account", async () => {
  
    const account: AccountCreate = {
      email: "john@example.com",
      company_name: "Apple",
      handle: "apple"
    };
  
    const responseData: AccountGet = {
      id: "random-user-id",
      email: "john@example.com",
      company_name: "Apple",
      handle: "apple"
    };
    
    axios.post.mockResolvedValue({ data: responseData });
  
    const accountGet: AccountGet = await createAccount(account);
  
    expect(accountGet).toEqual(responseData);
    expect(accountGet.id).toEqual("random-user-id");
  });

})



