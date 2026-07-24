import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Button, App } from 'antd';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';

const Args = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:TablePage@Table', 'components-core:FormInfo']
})(
  withLocale(({ remoteModules, tenant, reload }) => {
    const [usePreset, Table, FormInfo] = remoteModules;
    const { formatMessage } = useIntl();
    const { apis, ajax } = usePreset();
    const { useFormModal, TableList } = FormInfo;
    const { Input, Switch } = FormInfo.fields;
    const formModal = useFormModal();
    const { message } = App.useApp();
    const args = tenant.tenantSetting?.args || [];

    const formInner = (
      <TableList
        title={formatMessage({ id: 'EnvironmentVariables' })}
        name="args"
        minLength={1}
        column={1}
        list={[
          <Input name="key" label={formatMessage({ id: 'Key' })} rule="REQ LEN-0-100" />,
          <Input name="value" label={formatMessage({ id: 'Value' })} rule="REQ LEN-0-500" />,
          <Switch name="secret" label={formatMessage({ id: 'IsSecret' })} />
        ]}
      />
    );

    return (
      <Flex vertical gap={8}>
        <Flex justify="flex-end">
          <Button
            type="primary"
            size="small"
            onClick={() => {
              formModal({
                title: formatMessage({ id: 'AddEnvironmentVariable' }),
                size: 'small',
                children: formInner,
                formProps: {
                  onSubmit: async formData => {
                    const { data: resData } = await ajax(
                      Object.assign({}, apis.tenantAdmin.appendArgs, {
                        data: Object.assign({}, formData, {
                          tenantId: tenant.id
                        })
                      })
                    );
                    if (resData.code !== 0) {
                      return false;
                    }
                    message.success(formatMessage({ id: 'AddSuccess' }));
                    reload();
                  }
                }
              });
            }}
          >
            {formatMessage({ id: 'AddEnvironmentVariable' })}
          </Button>
        </Flex>
        <Table
          rowKey="key"
          dataSource={args}
          columns={[
            {
              name: 'key',
              title: 'KEY'
            },
            {
              name: 'value',
              title: formatMessage({ id: 'Value' }),
              renderType: 'description'
            },
            {
              name: 'secret',
              title: formatMessage({ id: 'IsSecret' }),
              getValueOf: item => String(item.secret !== void 0 ? item.secret : false)
            },
            {
              name: 'options',
              renderType: 'options',
              title: formatMessage({ id: 'Operation' }),
              fixed: 'right',
              getValueOf: item => {
                return [
                  {
                    children: formatMessage({ id: 'Delete' }),
                    confirm: true,
                    onClick: async () => {
                      const { data: resData } = await ajax(
                        Object.assign({}, apis.tenantAdmin.removeArg, {
                          data: {
                            tenantId: tenant.id,
                            key: item.key
                          }
                        })
                      );
                      if (resData.code !== 0) {
                        return;
                      }
                      message.success(formatMessage({ id: 'DeleteSuccess' }));
                      reload();
                    }
                  }
                ];
              }
            }
          ]}
        />
      </Flex>
    );
  })
);

export default Args;
