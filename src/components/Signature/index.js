import { createWithRemoteLoader } from '@kne/remote-loader';
import getColumns from './getColumns';
import { App, Flex, Alert, Button } from 'antd';
import UserSelect from '@components/UserSelect';
import withLocale from './withLocale';
import { useIntl } from '@kne/react-intl';
import BizUnit from '@components/BizUnit';
import { useRef } from 'react';

const VerifyAction = createWithRemoteLoader({
  modules: ['components-core:FormInfo', 'components-core:FormInfo@useFormModal', 'components-core:Global@usePreset']
})(({ remoteModules, data }) => {
  const [FormInfo, useFormModal, usePreset] = remoteModules;
  const { formatMessage } = useIntl();
  const { ajax, apis } = usePreset();
  const { TextArea, Input } = FormInfo.fields;
  const formModal = useFormModal();
  const { message } = App.useApp();

  return (
    <a
      onClick={() => {
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
            data: { appId: data.appId },
            onSubmit: async formData => {
              const { data: resData } = await ajax(
                Object.assign({}, apis.signature.verify, {
                  data: { appId: data.appId, ...formData }
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
      }}
    >
      {formatMessage({ id: 'Verify' })}
    </a>
  );
});

const CreateButton = createWithRemoteLoader({
  modules: [
    'components-core:FormInfo',
    'components-core:FormInfo@useFormModal',
    'components-core:Global@usePreset',
    'components-core:InfoPage@CentralContent'
  ]
})(({ remoteModules, onSuccess }) => {
  const [FormInfo, useFormModal, usePreset, CentralContent] = remoteModules;
  const { formatMessage } = useIntl();
  const { ajax, apis } = usePreset();
  const { TextArea } = FormInfo.fields;
  const formModal = useFormModal();
  const { modal } = App.useApp();

  return (
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
              onSuccess && onSuccess();
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
  );
});

const Signature = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(withLocale(({ remoteModules }) => {
  const [usePreset] = remoteModules;
  const { apis: presetApis } = usePreset();
  const { formatMessage } = useIntl();
  const tableRef = useRef(null);

  const apis = {
    list: presetApis.signature.list,
    remove: presetApis.signature.remove,
    setStatus: presetApis.signature.update
  };

  const columnsGetColumns = () => getColumns({ formatMessage });

  const getActionList = ({ data, ...props }) => {
    const baseActions = ['setStatusOpen', 'setStatusClose', 'remove']
      .map(name => ({
        name,
        reset: (config) => {
          if (name === 'remove') {
            return { ...config, hidden: data.status === 0 };
          }
          if (name === 'setStatusOpen') {
            return { ...config, hidden: data.status === 0 };
          }
          if (name === 'setStatusClose') {
            return { ...config, hidden: data.status === 1 };
          }
          return config;
        }
      }));

    return [
      {
        ...props,
        buttonComponent: VerifyAction,
        data
      },
      ...baseActions
    ];
  };

  const options = {
    bizName: '密钥',
    openStatus: 0,
    closedStatus: 1,
    openButtonProps: {
      children: formatMessage({ id: 'Enabled' })
    },
    closeButtonProps: {
      children: formatMessage({ id: 'Disabled' })
    },
    closeMessage: formatMessage({ id: 'DisableSecretKeyMessage' }),
    removeMessage: formatMessage({ id: 'ConfirmDelete' }, { bizName: '密钥' })
  };

  return (
    <BizUnit
      name="signature-list"
      apis={apis}
      getColumns={columnsGetColumns}
      getActionList={getActionList}
      options={options}
      allowKeywordSearch={false}
      onMount={({ tableOptions }) => {
        tableRef.current = tableOptions.ref.current;
      }}
      titleExtra={
        <CreateButton onSuccess={() => tableRef.current?.reload()} />
      }
    />
  );
}));

export default Signature;
export { getColumns };
