import {ApiToken, Auth0Token} from '@models/Token';
import prisma from '@repositories/prisma/PrismaClient';
import {PrismaException} from '@utils/PrismaException';
import {NotFound} from '@utils/HttpException';
import {Prisma} from '@prisma/client';


export default class TokenRepository {

  async findByAudience(audience: string) : Promise<ApiToken> {
    try {
      const apiToken = await prisma.tokenStore.findUnique({
        where: {
          audience,
        },
      });
      if (apiToken) {
        return <ApiToken><unknown>apiToken;
      } else {
        throw new NotFound('Resource not found');
      }
    } catch (error) {
      throw new PrismaException(error.error_code, error.message, error.meta);
    }

  }

  async updateByAudience(audience: string, auth0Token :Auth0Token): Promise<ApiToken> {
    try {

      const token_data = (auth0Token as unknown) as Prisma.JsonArray;

      prisma.tokenStore.upsert({
        where: {
          audience,
        },
        update: {
          token_data,
        },
        create: {
          audience,
          token_data,
        },
      });


      return this.findByAudience(audience);
    } catch (error) {
      throw new PrismaException(error.error_code, error.message, error.meta);
    }
  }

}
