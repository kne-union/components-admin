import { useState, useRef } from 'react';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { Space, Button, App } from 'antd';
import getColumns from './getColumns';
import FormInner from './FormInner';
import ResetPasswordFormInner from './ResetPasswordFormInner';
import md5 from 'md5';
import get from 'lodash/get';

const User = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Filter', 'components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(({ remoteModules }) => {
  const [TablePage, Filter, useFormModal, usePreset] = remoteModules;
  const [filter, setFilter] = useState([]);
  const { SearchInput, getFilterValue, fields: filterFields } = Filter;
  const { InputFilterItem, AdvancedSelectFilterItem } = filterFields;
  const { ajax, apis } = usePreset();
  const formModal = useFormModal();
  const { message } = App.useApp();
  const ref = useRef(null);
  const filterValue = getFilterValue(filter);
  return (
    <TablePage
      {...Object.assign({}, apis.admin.getUserList, { params: { filter: filterValue } })}
      pagination={{ paramsType: 'params' }}
      name="user-list"
      ref={ref}
      columns={[
        ...getColumns(),
        {
          name: 'options',
          title: '操作',
          type: 'options',
          fixed: 'right',
          valueOf: item => {
            return [
              {
                children: '编辑',
                onClick: () => {
                  const modalApi = formModal({
                    title: '编辑用户信息',
                    size: 'small',
                    children: <FormInner />,
                    formProps: {
                      data: Object.assign({}, item),
                      onSubmit: async data => {
                        const { data: resData } = await ajax(
                          Object.assign({}, apis.admin.saveUser, {
                            data: Object.assign({}, data, { id: item.id })
                          })
                        );
                        if (resData.code !== 0) {
                          return;
                        }
                        message.success('修改成功');
                        ref.current.reload();
                        modalApi.close();
                      }
                    }
                  });
                }
              },
              {
                children: '修改密码',
                onClick: () => {
                  const modalApi = formModal({
                    title: '修改用户密码',
                    size: 'small',
                    children: <ResetPasswordFormInner />,
                    formProps: {
                      onSubmit: async data => {
                        const { data: resData } = await ajax(
                          Object.assign({}, apis.admin.resetUserPassword, {
                            data: {
                              password: md5(data.password),
                              userId: item.id
                            }
                          })
                        );
                        if (resData.code !== 0) {
                          return;
                        }
                        message.success('修改密码成功');
                        modalApi.close();
                      }
                    }
                  });
                }
              },
              get(item, 'isSuperAdmin') === true
                ? {
                    children: '取消超管',
                    message: '确定要取消账号的超管权限吗？',
                    isDelete: false,
                    onClick: async () => {
                      const { data: resData } = await ajax(
                        Object.assign({}, apis.admin.setSuperAdmin, {
                          data: { status: false, userId: item.id }
                        })
                      );
                      if (resData.code !== 0) {
                        return;
                      }
                      message.success('设置成功');
                      ref.current.reload();
                    }
                  }
                : {
                    children: '设置超管',
                    message: '确定要设置账号为超管吗？',
                    isDelete: false,
                    onClick: async () => {
                      const { data: resData } = await ajax(
                        Object.assign({}, apis.admin.setSuperAdmin, {
                          data: { status: true, userId: item.id }
                        })
                      );
                      if (resData.code !== 0) {
                        return;
                      }
                      message.success('设置成功');
                      ref.current.reload();
                    }
                  },
              ...(() => {
                const list = [];
                if (item.status !== 0) {
                  list.push({
                    confirm: true,
                    children: '设置为正常',
                    message: '确定要设置账号为正常吗？',
                    isDelete: false,
                    onClick: async () => {
                      const { data: resData } = await ajax(
                        Object.assign({}, apis.admin.setUserNormal, {
                          data: {
                            id: item.id
                          }
                        })
                      );
                      if (resData.code !== 0) {
                        return;
                      }
                      message.success('账号已开启');
                      ref.current.reload();
                    }
                  });
                }
                if (item.status !== 12) {
                  list.push({
                    isDelete: true,
                    confirm: true,
                    children: '关闭',
                    message: '确定要关闭该账号吗？',
                    okText: '确认',
                    onClick: async () => {
                      const { data: resData } = await ajax(
                        Object.assign({}, apis.admin.setUserClose, {
                          data: {
                            id: item.id
                          }
                        })
                      );
                      if (resData.code !== 0) {
                        return;
                      }
                      message.success('账号已关闭');
                      ref.current.reload();
                    }
                  });
                }
                return list;
              })()
            ];
          }
        }
      ]}
      page={{
        filter: {
          value: filter,
          onChange: setFilter,
          list: [
            [
              <InputFilterItem label="邮箱" name="email" />,
              <InputFilterItem label="电话" name="phone" />,
              <AdvancedSelectFilterItem
                label="状态"
                name="status"
                single
                api={{
                  loader: () => {
                    return {
                      pageData: [
                        { label: '正常', value: 0 },
                        {
                          label: '初始化未激活',
                          value: 10
                        },
                        { label: '已关闭', value: 12 }
                      ]
                    };
                  }
                }}
              />,
              <AdvancedSelectFilterItem
                label="是否管理员"
                name="isSuperAdmin"
                single
                api={{
                  loader: () => {
                    return {
                      pageData: [
                        { label: '是', value: true },
                        { label: '否', value: false }
                      ]
                    };
                  }
                }}
              />
            ]
          ]
        },
        titleExtra: (
          <Space align="center">
            <SearchInput name="nickname" label="昵称" />
            <Button
              type="primary"
              onClick={() => {
                const modalApi = formModal({
                  title: '添加用户',
                  size: 'small',
                  children: <FormInner />,
                  formProps: {
                    onSubmit: async data => {
                      const { data: resData } = await ajax(
                        Object.assign({}, apis.admin.addUser, {
                          data: Object.assign({}, data)
                        })
                      );
                      if (resData.code !== 0) {
                        return;
                      }
                      message.success('添加成功');
                      ref.current.reload();
                      modalApi.close();
                    }
                  }
                });
              }}
            >
              添加用户
            </Button>
          </Space>
        )
      }}
    />
  );
});

export default User;
