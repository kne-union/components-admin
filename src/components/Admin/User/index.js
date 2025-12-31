import { useState, useRef } from 'react';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { Space, Button, App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import getColumns from './getColumns';
import FormInner from './FormInner';
import ResetPasswordFormInner from './ResetPasswordFormInner';
import md5 from 'md5';
import get from 'lodash/get';

const UserInner = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Filter', 'components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(({ remoteModules }) => {
  const [TablePage, Filter, useFormModal, usePreset] = remoteModules;
  const { formatMessage } = useIntl();
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
        ...getColumns({ formatMessage }),
        {
          name: 'options',
          title: formatMessage({ id: 'Operation' }),
          type: 'options',
          fixed: 'right',
          valueOf: item => {
            return [
              {
                children: formatMessage({ id: 'EditUser' }),
                onClick: () => {
                  const modalApi = formModal({
                    title: formatMessage({ id: 'EditUserInfo' }),
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
                        message.success(formatMessage({ id: 'SaveSuccess' }));
                        ref.current.reload();
                        modalApi.close();
                      }
                    }
                  });
                }
              },
              {
                children: formatMessage({ id: 'ModifyPassword' }),
                onClick: () => {
                  const modalApi = formModal({
                    title: formatMessage({ id: 'ModifyPassword' }),
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
                        message.success(formatMessage({ id: 'ModifyPasswordSuccess' }));
                        modalApi.close();
                      }
                    }
                  });
                }
              },
              get(item, 'isSuperAdmin') === true
                ? {
                    children: formatMessage({ id: 'CancelSuperAdmin' }),
                    message: formatMessage({ id: 'CancelSuperAdminConfirm' }),
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
                      message.success(formatMessage({ id: 'SetStatusSuccess' }));
                      ref.current.reload();
                    }
                  }
                : {
                    children: formatMessage({ id: 'SetSuperAdmin' }),
                    message: formatMessage({ id: 'SetSuperAdminConfirm' }),
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
                      message.success(formatMessage({ id: 'SetStatusSuccess' }));
                      ref.current.reload();
                    }
                  },
              ...(() => {
                const list = [];
                if (item.status !== 0) {
                  list.push({
                    confirm: true,
                    children: formatMessage({ id: 'SetNormal' }),
                    message: formatMessage({ id: 'SetNormalConfirm' }),
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
                      message.success(formatMessage({ id: 'SetNormalSuccess' }));
                      ref.current.reload();
                    }
                  });
                }
                if (item.status !== 12) {
                  list.push({
                    isDelete: true,
                    confirm: true,
                    children: formatMessage({ id: 'CloseUser' }),
                    message: formatMessage({ id: 'CloseUserConfirm' }),
                    okText: formatMessage({ id: 'Confirm' }),
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
                      message.success(formatMessage({ id: 'CloseUserSuccess' }));
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
              <InputFilterItem label={formatMessage({ id: 'FilterEmail' })} name="email" />,
              <InputFilterItem label={formatMessage({ id: 'FilterPhone' })} name="phone" />,
              <AdvancedSelectFilterItem
                label={formatMessage({ id: 'FilterStatus' })}
                name="status"
                single
                api={{
                  loader: () => {
                    return {
                      pageData: [
                        { label: formatMessage({ id: 'Normal' }), value: 0 },
                        {
                          label: formatMessage({ id: 'NotActivated' }),
                          value: 10
                        },
                        { label: formatMessage({ id: 'Closed' }), value: 12 }
                      ]
                    };
                  }
                }}
              />,
              <AdvancedSelectFilterItem
                label={formatMessage({ id: 'FilterIsAdmin' })}
                name="isSuperAdmin"
                single
                api={{
                  loader: () => {
                    return {
                      pageData: [
                        { label: formatMessage({ id: 'Yes' }), value: true },
                        { label: formatMessage({ id: 'No' }), value: false }
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
            <SearchInput name="nickname" label={formatMessage({ id: 'Nickname' })} />
            <Button
              type="primary"
              onClick={() => {
                const modalApi = formModal({
                  title: formatMessage({ id: 'AddUser' }),
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
                      message.success(formatMessage({ id: 'AddSuccess' }));
                      ref.current.reload();
                      modalApi.close();
                    }
                  }
                });
              }}
            >
              {formatMessage({ id: 'AddUser' })}
            </Button>
          </Space>
        )
      }}
    />
  );
});

export default withLocale(UserInner);
