import { createWithRemoteLoader } from '@kne/remote-loader';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import BizUnit from '@components/BizUnit';
import withLocale from '../withLocale';
import Menu from '../Menu';
import SecretResult from '../SecretResult';
import getColumns from './getColumns';
import FormInner from './FormInner';
import { toFormData, toPayload } from './utils';

const RotateSecretButton = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, data, onSuccess, apis: _apis, options, getFormInner, fetchOptions, ...props }) => {
    const [ConfirmButton, usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { modal, message } = App.useApp();
    const { formatMessage } = useIntl();
    return (
      <ConfirmButton
        {...props}
        message={formatMessage({ id: 'RotateSecretConfirm' })}
        onClick={async () => {
          const { data: resData } = await ajax(Object.assign({}, apis.oidc.client.rotateSecret, { data: { id: data.id } }));
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'SecretRotated' }));
          modal.info({
            icon: null,
            width: 640,
            title: formatMessage({ id: 'SecretRotated' }),
            content: <SecretResult formatMessage={formatMessage} {...resData.data} />
          });
          onSuccess && onSuccess();
        }}>
        {formatMessage({ id: 'RotateSecret' })}
      </ConfirmButton>
    );
  })
);

const ClientManager = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Filter']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset, Filter] = remoteModules;
    const { SuperSelectFilterItem } = Filter.fields;
    const { ajax, apis: presetApis } = usePreset();
    const { modal } = App.useApp();
    const { formatMessage } = useIntl();
    const apis = presetApis.oidc.client;
    const bizName = formatMessage({ id: 'Client' });

    return (
      <BizUnit
        isNext
        name="oidc-client-list"
        page={{
          title: formatMessage({ id: 'ClientManager' }),
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps
        }}
        apis={{
          list: apis.list,
          create: apis.create,
          save: ({ formData, data }) => Object.assign({}, apis.save, { data: Object.assign(toPayload(formData, data.metadata), { id: data.id }) }),
          remove: apis.remove,
          setStatus: apis.setStatus
        }}
        getColumns={() => getColumns({ formatMessage })}
        getFormInner={({ action }) => <FormInner action={action} />}
        getActionList={({ data, ...props }) => [
          {
            ...props,
            data,
            type: 'link',
            buttonComponent: RotateSecretButton,
            hidden: !data.hasSecret
          }
        ]}
        options={{
          bizName,
          saveData: toFormData,
          // 机密应用的 client secret 只在创建时返回一次，需自行提交以便展示
          formProps: ({ action, onSuccess }) => {
            if (action !== 'create') {
              return {};
            }
            return {
              onSubmit: async formData => {
                const { data: resData } = await ajax(Object.assign({}, apis.create, { data: toPayload(formData) }));
                if (resData.code !== 0) {
                  return false;
                }
                if (resData.data?.clientSecret) {
                  modal.info({
                    icon: null,
                    width: 640,
                    title: formatMessage({ id: 'ClientCreated' }),
                    content: <SecretResult formatMessage={formatMessage} {...resData.data} />
                  });
                }
                onSuccess && onSuccess();
              }
            };
          },
          keywordFilterName: 'keyword',
          keywordFilterLabel: formatMessage({ id: 'Keyword' })
        }}
        filter={{
          list: [
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'status',
                label: formatMessage({ id: 'Status' }),
                single: true,
                options: [
                  { label: formatMessage({ id: 'StatusOpen' }), value: 'open' },
                  { label: formatMessage({ id: 'StatusClosed' }), value: 'closed' }
                ]
              }
            }
          ]
        }}
      />
    );
  })
);

export default ClientManager;
