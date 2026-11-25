import { createWithRemoteLoader } from '@kne/remote-loader';
import { useRef } from 'react';
import { App } from 'antd';
import { useIntl } from '@kne/react-intl';
import BizUnit, { TablePageRender } from '@components/BizUnit';
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
        }}
      >
        {formatMessage({ id: 'RotateKey' })}
      </ConfirmButton>
    );
  })
);

/**
 * 签名密钥：只读列表 + 工具栏轮换，无行内 CRUD。
 * 走 BizUnit（list loader 归一 pageData；无 create/save/remove 即无添加与内置操作列按钮）。
 */
const KeyManager = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, baseUrl, pageProps = {} }) => {
    const [usePreset] = remoteModules;
    const { ajax, apis: presetApis } = usePreset();
    const { formatMessage } = useIntl();
    const tableRef = useRef(null);
    const keyApis = presetApis.oidc.key;

    return (
      <BizUnit
        isNext
        allowKeywordSearch={false}
        name="oidc-key-list"
        page={{
          title: formatMessage({ id: 'KeyManager' }),
          menu: <Menu baseUrl={baseUrl} />,
          ...pageProps
        }}
        apis={{
          list: {
            loader: async () => {
              const { data: resData } = await ajax(Object.assign({}, keyApis.list));
              if (resData.code !== 0) {
                return { pageData: [], totalCount: 0 };
              }
              const list = Array.isArray(resData.data) ? resData.data : resData.data?.pageData || [];
              return { pageData: list, totalCount: list.length };
            }
          }
        }}
        getColumns={() => [
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
        getActionList={() => []}
        options={{
          bizName: formatMessage({ id: 'KeyManager' }),
          tableProps: {
            pagination: { open: false },
            buttonGroup: {
              list: [
                {
                  buttonComponent: RotateKeyButton,
                  type: 'primary',
                  onSuccess: () => tableRef.current?.current?.reload?.()
                }
              ]
            }
          }
        }}
      >
        {props => {
          tableRef.current = props.tableOptions?.ref;
          // 无行操作时去掉空「操作」列
          const columns = (props.tableOptions?.columns || []).filter(col => col.name !== 'options');
          return <TablePageRender {...props} tableOptions={Object.assign({}, props.tableOptions, { columns })} />;
        }}
      </BizUnit>
    );
  })
);

export default KeyManager;
