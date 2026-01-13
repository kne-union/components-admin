import { createWithRemoteLoader } from '@kne/remote-loader';
import getColumns from './getColumns';
import { useRef } from 'react';
import { Space, Button, App, Flex, Alert } from 'antd';
import UserSelect from '@components/UserSelect';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';

const Signature = createWithRemoteLoader({
  modules: [
    'components-core:Layout@TablePage',
    'components-core:Global@usePreset',
    'components-core:FormInfo',
    'components-core:FormInfo@useFormModal',
    'components-core:InfoPage@CentralContent'
  ]
})(withLocale(({ remoteModules }) => {
  const [TablePage, usePreset, FormInfo, useFormModal, CentralContent] = remoteModules;
  const { ajax, apis } = usePreset();
  const { formatMessage } = useIntl();
  const ref = useRef(null);
  const { TextArea, Input } = FormInfo.fields;
  const formModal = useFormModal();
  const { modal } = App.useApp();
  const { message } = App.useApp();
  return (
    <TablePage
      {...Object.assign({}, apis.signature.list)}
      pagination={{ paramsType: 'params' }}
      name="signature-list"
      ref={ref}
      page={{
        titleExtra: (
          <Space align="center">
            <Button
              type="primary"
              onClick={() => {
                const formModalApi = formModal({
                  title: formatMessage({ id: 'AddSecretKey' }),
                  size: 'small',
                  formProps: {
                    onSubmit: async data => {
                      const { data: resData } = await ajax(
                        Object.assign({}, apis.signature.create, {
                          data
                        })
                      );
                      if (resData.code !== 0) {
                        return;
                      }
                      ref.current.reload();
                      formModalApi.close();
                      modal.info({
                        icon: null,
                        size: 'large',
                        width: '800px',
                        title: formatMessage({ id: 'SecretKeyGenerated' }),
                        content: (
                          <Flex vertical gap={10}>
                            <Alert type="error" message={formatMessage({ id: 'SaveSecretKeyWarning' })} />
                            <CentralContent
                              dataSource={resData.data}
                              col={1}
                              columns={[
                                {
                                  name: 'appId',
                                  title: 'AppId'
                                },
                                {
                                  name: 'secretKey',
                                  title: 'SecretKey'
                                }
                              ]}
                            />
                          </Flex>
                        )
                      });
                    }
                  },
                  children: (
                    <FormInfo
                      column={1}
                      list={[
                        <UserSelect name="userId" label={formatMessage({ id: 'BelongUser' })} single interceptor="object-output-value" />,
                        <TextArea name="description" label={formatMessage({ id: 'Description' })} maxLength={100} />
                      ]}
                    />
                  )
                });
              }}
            >
              {formatMessage({ id: 'AddSecretKey' })}
            </Button>
          </Space>
        )
      }}
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
                children: formatMessage({ id: 'Verify' }),
                onClick: () => {
                  formModal({
                    title: formatMessage({ id: 'VerifySecretKey' }),
                    size: 'small',
                    saveText: formatMessage({ id: 'Verify' }),
                    formProps: {
                      rules: {
                        NUM: value => {
                          if (/^[0-9]+$/.test(value)) {
                            return {
                              result: true,
                              errMsg: ''
                            };
                          }
                          return {
                            result: false,
                            errMsg: formatMessage({ id: 'InputNumber' })
                          };
                        }
                      },
                      data: { appId: item.appId, ...item },
                      onSubmit: async data => {
                        const { data: resData } = await ajax(
                          Object.assign({}, apis.signature.verify, {
                            data: { appId: item.appId, ...data }
                          })
                        );

                        if (resData.code !== 0) {
                          return;
                        }
                        if (resData.data.result) {
                          message.success(formatMessage({ id: 'VerifySuccess' }));
                        } else {
                          message.error(`${formatMessage({ id: 'VerifyFailed' })},${resData.data.message}`);
                        }
                      }
                    },
                    children: (
                      <FormInfo
                        column={1}
                        list={[
                          <TextArea name="signature" label={formatMessage({ id: 'Signature' })} rule="REQ" />,
                          <Input name="timestamp" label={formatMessage({ id: 'Timestamp' })} rule="REQ NUM" />,
                          <Input name="expire" label={formatMessage({ id: 'ExpireTime' })} rule="REQ NUM" />
                        ]}
                      />
                    )
                  });
                }
              },
              {
                children: item.status === 0 ? formatMessage({ id: 'Disabled' }) : formatMessage({ id: 'Enabled' }),
                title: formatMessage({ id: 'DisableSecretKeyTitle' }),
                message:
                  item.status === 0 ? (
                    <div>
                      <div>{formatMessage({ id: 'DisableSecretKeyMessage' })}</div>
                    </div>
                  ) : (
                    <div>
                      <div>{formatMessage({ id: 'EnableSecretKeyMessage' })}</div>
                    </div>
                  ),
                isModal: true,
                isDelete: false,
                onClick: async () => {
                  const { data: resData } = await ajax(
                    Object.assign({}, apis.signature.update, {
                      data: { appId: item.appId, status: item.status === 0 ? 1 : 0 }
                    })
                  );

                  if (resData.code !== 0) {
                    return;
                  }
                  message.success(formatMessage({ id: 'OperationSuccess' }));
                  ref.current.reload();
                }
              },
              {
                children: formatMessage({ id: 'DeleteSuccess' }),
                confirm: true,
                hidden: item.status === 0,
                onClick: async () => {
                  const { data: resData } = await ajax(
                    Object.assign({}, apis.signature.remove, {
                      data: { appId: item.appId }
                    })
                  );
                  if (resData.code !== 0) {
                    return;
                  }
                  message.success(formatMessage({ id: 'DeleteSuccess' }));
                  ref.current.reload();
                }
              }
            ];
          }
        }
      ]}
    />
  );
}));

export default Signature;
