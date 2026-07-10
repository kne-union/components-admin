import merge from 'lodash/merge';
import { request } from '@kne/react-fetch';
import invokeUserApiLoader from './invokeUserApiLoader';

export const normalizeUserListPageData = response => {
  if (Array.isArray(response?.pageData)) {
    return response.pageData;
  }
  if (Array.isArray(response?.data?.pageData)) {
    return response.data.pageData;
  }
  if (Array.isArray(response?.data?.data?.pageData)) {
    return response.data.data.pageData;
  }
  return [];
};

const fetchUserList = async (api, extraParams = {}) => {
  if (typeof api?.loader === 'function') {
    const response = await invokeUserApiLoader(api, extraParams);
    return normalizeUserListPageData(response);
  }

  if (api?.url) {
    const response = await request(
      merge({}, api, {
        params: merge({}, api.params, extraParams)
      })
    );
    const payload = response?.data?.data ?? response?.data;
    return normalizeUserListPageData(payload);
  }

  return [];
};

export default fetchUserList;
