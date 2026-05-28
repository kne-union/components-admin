import merge from 'lodash/merge';

/** 构建角色列表 API 配置，过滤系统默认角色并仅展示启用状态 */
const getRoleListApi = apis =>
  merge({}, apis.roleList, {
    params: {
      filter: { status: 'open' },
      ...(apis.roleList?.params || {})
    },
    transformData: data =>
      Object.assign({}, data, {
        pageData: (data.pageData || []).filter(
          item => !(item.type === 'system' && item.code === 'default')
        )
      })
  });

export default getRoleListApi;
