import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Button, App } from 'antd';

const Setting = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Table', 'components-core:FormInfo']
})(({ remoteModules, tenant, reload }) => {
  const [usePreset, Table, FormInfo] = remoteModules;
  const { apis, ajax } = usePreset();
  const { useFormModal, TableList } = FormInfo;
  const { Input, Switch } = FormInfo.fields;
  const formModal = useFormModal();
  const { message } = App.useApp();
  const formInner = <TableList name="args" minLength={1} column={1} list={[<Input name="key" label="键" rule="REQ LEN-0-100" />, <Input name="value" label="值" rule="REQ LEN-0-500" />, <Switch name="secret" label="是否密钥" />]} />;
  const args = tenant.tenantSetting?.args || [];
  return (
    <Flex vertical gap={8}>
      <Flex justify="space-between">
        <div></div>
        <Flex gap={8}>
          <Button
            type="primary"
            onClick={() => {
              formModal({
                title: '添加环境变量',
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
                    message.success('添加成功');
                    reload();
                  }
                }
              });
            }}
          >
            添加环境变量
          </Button>
        </Flex>
      </Flex>
      <Table
        rowKey="key"
        dataSource={args}
        columns={[
          {
            name: 'key',
            title: '键'
          },
          {
            name: 'value',
            title: '值',
            type: 'description'
          },
          {
            name: 'secret',
            title: '是否密钥',
            type: 'singleRow',
            valueOf: item => String(item.secret !== void 0 ? item.secret : false)
          },
          {
            name: 'options',
            type: 'options',
            title: '操作',
            valueOf: item => {
              return [
                {
                  children: '删除',
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
                    message.success('删除成功');
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
});

export default Setting;
