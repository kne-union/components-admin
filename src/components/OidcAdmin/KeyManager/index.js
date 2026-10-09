import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef } from 'react';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import Menu from '../Menu';

const KEY_STATUS = {
  active: { type: 'success', id: 'KeyActive' },
  next: { type: 'info', id: 'KeyNext' },
  retired: { type: 'default', id: 'KeyRetired' }
};

const RotateKeyButton = createWithRemoteLoader({
  modules: ['components-core:ConfirmButton', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, onSuccess, ...props }) => {
    const [ConfirmButton, usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    return (
      <ConfirmButton
        {...props}
        message={formatMessage({ id: 'RotateKeyConfirm' })}
        onClick={async () => {
          const { data: resData } = await ajax(Object.assign({}, apis.oidc.key.rotate));
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'KeyRotated' }));
          onSuccess && onSuccess();
        }}>
        {formatMessage({ id: 'RotateKey' })}
      </ConfirmButton>
    );
  })
);

const KeyManager = createWithRemoteLoader({
  modules: ['components-core:Layout@TablePage', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [TablePage, usePreset] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const ref = useRef(null);

    return (
      <TablePage
        isNext
        {...Object.assign({}, apis.oidc.key.list)}
        ref={ref}
        name="oidc-key-list"
        dataFormat={data => ({ list: data || [], total: (data || []).length, data })}
        pagination={{ open: false }}
        columns={[
          { name: 'kid', title: formatMessage({ id: 'Kid' }), renderType: 'main', width: 320 },
          { name: 'alg', title: formatMessage({ id: 'Alg' }), width: 100 },
          {
            name: 'status',
            title: formatMessage({ id: 'KeyStatus' }),
            renderType: 'tag',
            width: 120,
            getValueOf: item => {
              const status = KEY_STATUS[item.status] || KEY_STATUS.retired;
              return { type: status.type, text: formatMessage({ id: status.id }) };
            }
          },
          { name: 'activatedAt', title: formatMessage({ id: 'ActivatedAt' }), format: 'datetime', width: 180 },
          { name: 'retiredAt', title: formatMessage({ id: 'RetiredAt' }), format: 'datetime', width: 180 },
          { name: 'createdAt', title: formatMessage({ id: 'CreatedAt' }), format: 'datetime', width: 180 }
        ]}
        buttonGroup={{
          list: [
            {
              buttonComponent: RotateKeyButton,
              type: 'primary',
              onSuccess: () => ref.current?.reload?.()
            }
          ]
        }}
        page={{
          title: formatMessage({ id: 'KeyManager' }),
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps
        }}
      />
    );
  })
);

export default KeyManager;
