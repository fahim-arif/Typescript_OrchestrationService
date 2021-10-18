// Credits https://github.com/auth0-blog/wab-ts-express-api/blob/master/src/middleware/permissions.middleware.ts
import jwtAuthz from 'express-jwt-authz';

export const checkPermissions = (permissions: string[]) => {
  return jwtAuthz(permissions, {
    customScopeKey: 'permissions',
    checkAllScopes: true,
    failWithError: true,
  });
};
