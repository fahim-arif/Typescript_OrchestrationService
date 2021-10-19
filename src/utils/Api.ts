import axios from 'axios';
import qs from 'qs';
import * as AxiosLogger from 'axios-logger';

export const api = (apiBaseUrl:string) => {
  const axiosInstance = axios.create({
    baseURL: apiBaseUrl,
    timeout: 30000,
    headers: {
      'content-type': 'application/json',
    },
    paramsSerializer(params) {
      return qs.stringify(params, {
        arrayFormat: 'brackets',
        encodeValuesOnly: true,
      });
    },
  });

  /* global process */
  if (process.env.NODE_ENV === 'development') {
    axiosInstance.interceptors.request.use(AxiosLogger.requestLogger, AxiosLogger.errorLogger);
    axiosInstance.interceptors.response.use(AxiosLogger.responseLogger, AxiosLogger.errorLogger);
  }

  return axiosInstance;
};
