import { useMemo } from 'react';
import merge from 'lodash/merge';

const extractListBody = response => response?.data?.results ?? response?.data?.data ?? response?.data;

const useListApi = ({ apis, filterValue, ajax }) => {
  return useMemo(() => {
    const api = merge({}, apis.list, {
      params: {
        filter: filterValue,
        ...(apis.list?.params || {})
      }
    });
    if (api.loader) {
      return api;
    }
    return Object.assign({}, api, {
      loader: async () => extractListBody(await ajax(merge({}, api)))
    });
  }, [apis.list, filterValue, ajax]);
};

export default useListApi;
