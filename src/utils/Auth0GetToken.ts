import { Auth0TokenGet } from "@root/models/Auth0Token";
import axios, { AxiosResponse } from "axios";
import { InternalError } from "./HttpException";

export async function getToken() {

  const data = {
    audience: process.env.RESOURCE_SERVER,
    grant_type: 'client_credentials',
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET
  }

  try {
    const response: AxiosResponse<Auth0TokenGet> = await axios.post(
      `${process.env.AUTH0_ISSUER}/oauth/token`, 
      data
    )
    return response.data.access_token;
  } catch (error: any) {
    throw new InternalError(error.message)
  }

}