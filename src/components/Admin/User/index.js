import { useState, useRef, useCallback } from 'react';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import { useProps } from '../context';
import getColumns from './getColumns';
import FormInner from './FormInner';
import ResetPasswordFormInner from './ResetPasswordFormInner';
import UserMobileList from './UserMobileList';
import md5 from 'md5';
import get from 'lodash/get';

const UserInner = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Filter', 'components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(({ remoteModules, pageProps: propsPageProps }) => {
  const [TablePage, Filter, useFormModal, usePreset] = remoteModules;
  const { formatMessage } = useIntl();
  const contextProps = useProps();
  const pageProps = Object.assign({}, contextProps?.pageProps, propsPageProps);
  const [filter, setFilter] = useState([]);
  const { getFilterValue, fields: filterFields } = Filter;
  const { InputFilterItem, SuperSelectFilterItem } = filterFields;
  const { ajax, apis } = usePreset();
  const formModal = useFormModal();
  const { message } = App.useApp();
  const ref = useRef(null);
  const mobileListRef = useRef([]);

  const reloadTable = useCallback(() => {
    ref.current?.reload();
  }, []);

  const getActions = useCallback(
    item => {
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
                  reloadTable();
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
                reloadTable();
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
                reloadTable();
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
                reloadTable();
              }
            });
          }
          if (item.status !== 12) {
            list.push({
              isDelete: true,
              confirm: true,
              children: formatMessage({ id: 'CloseUser' }),
              message: formatMessage({ id: 'CloseAccountConfirm' }),
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
                reloadTable();
              }
            });
          }
          return list;
        })()
      ];
    },
    [ajax, apis.admin, formModal, formatMessage, message, reloadTable]
  );

  const renderMobile = useCallback(
    ({ dataSource } = {}) => <UserMobileList dataSource={dataSource ?? mobileListRef.current} getActions={getActions} />,
    [getActions]
  );

  return (
    <TablePage
      isNext
      search={{
        name: 'nickname',
        label: formatMessage({ id: 'Nickname' })
      }}
      filter={{
        value: filter,
        onChange: setFilter,
        // 接口参数在 params.filter 下；由 TablePage reload 合并，勿再抬升到 props.params.filter（lodash.merge 清不掉嵌套旧值）
        mapFilterValue: (filterValue, getFv) => ({
          filter: (getFv || getFilterValue)(filterValue || [])
        }),
        list: [
          {
            type: InputFilterItem,
            props: { label: formatMessage({ id: 'FilterEmail' }), name: 'email' }
          },
          {
            type: InputFilterItem,
            props: { label: formatMessage({ id: 'FilterPhone' }), name: 'phone' }
          },
          {
            type: SuperSelectFilterItem,
            props: {
              label: formatMessage({ id: 'FilterStatus' }),
              name: 'status',
              single: true,
              api: {
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
              }
            }
          },
          {
            type: SuperSelectFilterItem,
            props: {
              label: formatMessage({ id: 'FilterIsAdmin' }),
              name: 'isSuperAdmin',
              single: true,
              api: {
                loader: () => {
                  return {
                    pageData: [
                      { label: formatMessage({ id: 'Yes' }), value: true },
                      { label: formatMessage({ id: 'No' }), value: false }
                    ]
                  };
                }
              }
            }
          }
        ]
      }}
      {...apis.admin.getUserList}
      dataFormat={data => {
        const format = typeof apis.admin.getUserList?.dataFormat === 'function' ? apis.admin.getUserList.dataFormat : null;
        const formatted = format
          ? format(data)
          : {
              list: data.pageData,
              total: data.totalCount ?? data.total,
              data
            };
        mobileListRef.current = formatted?.list || [];
        return formatted;
      }}
      pagination={{ paramsType: 'params' }}
      name="user-list"
      ref={ref}
      menuFixed={pageProps?.menuFixed}
      renderMobile={renderMobile}
      columns={[
        ...getColumns({ formatMessage }),
        {
          name: 'options',
          title: formatMessage({ id: 'Operation' }),
          renderType: 'options',
          fixed: 'right',
          getValueOf: item => getActions(item)
        }
      ]}
      buttonGroup={{
        list: [
          {
            type: 'primary',
            children: formatMessage({ id: 'AddUser' }),
            onClick: () => {
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
                    reloadTable();
                    modalApi.close();
                  }
                }
              });
            }
          }
        ]
      }}
    />
  );
});

export default withLocale(UserInner);
