import { createWithRemoteLoader } from '@kne/remote-loader';
import getColumns from './getColumns';
import { useRef } from 'react';
import { Space, Button, App, Flex, Alert } from 'antd';
import UserSelect from '@components/UserSelect';

const Signature = createWithRemoteLoader({
  modules: [
    'components-core:Layout@TablePage',
    'components-core:Global@usePreset',
    'components-core:FormInfo',
    'components-core:FormInfo@useFormModal',
    'components-core:InfoPage@CentralContent'
  ]
})(({ remoteModules }) => {
  const [TablePage, usePreset, FormInfo, useFormModal, CentralContent] = remoteModules;
  const { ajax, apis } = usePreset();
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
                  title: '添加密钥',
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
                        title: '密钥生成成功',
                        content: (
                          <Flex vertical gap={10}>
                            <Alert type="error" message="请妥善保存当前密钥，关闭窗口后将不能再获取到，请勿泄漏" />
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
                        <UserSelect name="userId" label="所属用户" single interceptor="object-output-value" />,
                        <TextArea name="description" label="描述" maxLength={100} />
                      ]}
                    />
                  )
                });
              }}
            >
              添加密钥
            </Button>
          </Space>
        )
      }}
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
                children: '验证',
                onClick: () => {
                  formModal({
                    title: '验证密钥',
                    size: 'small',
                    saveText: '验证',
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
                            errMsg: '请输入数字'
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
                          message.success('验证成功');
                        } else {
                          message.error(`验证失败,${resData.data.message}`);
                        }
                      }
                    },
                    children: (
                      <FormInfo
                        column={1}
                        list={[
                          <TextArea name="signature" label="签名" rule="REQ" />,
                          <Input name="timestamp" label="时间戳" rule="REQ NUM" />,
                          <Input name="expire" label="过期时间" rule="REQ NUM" />
                        ]}
                      />
                    )
                  });
                }
              },
              {
                children: item.status === 0 ? '禁用' : '启用',
                title: '温馨提示',
                message:
                  item.status === 0 ? (
                    <div>
                      <div>禁用此密钥后，将拒绝此密钥的所有请求。</div>
                      <div>是否确定要禁用此密钥？</div>
                    </div>
                  ) : (
                    <div>
                      <div>启用此密钥后，将允许此密钥访问请求。</div>
                      <div>是否确定要启用此密钥？</div>
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
                  message.success('操作成功');
                  ref.current.reload();
                }
              },
              {
                children: '删除',
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
                  message.success('删除成功');
                  ref.current.reload();
                }
              }
            ];
          }
        }
      ]}
    />
  );
});

export default Signature;
