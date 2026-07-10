import merge from 'lodash/merge';

const invokeUserApiLoader = (api, extraParams = {}) => {
  if (typeof api?.loader !== 'function') {
    return null;
  }
  const params = merge({}, api.params, extraParams);
  return api.loader({
    filter: params.filter,
    params
  });
};

export default invokeUserApiLoader;
