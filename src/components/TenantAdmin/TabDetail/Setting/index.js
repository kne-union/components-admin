import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Button, App } from 'antd';
import { useState, forwardRef, useImperativeHandle } from 'react';
import style from './style.module.scss';

const LiveComponent = createWithRemoteLoader({
  modules: ['components-thirdparty:LiveComponentEditor']
})(
  forwardRef(({ remoteModules, defaultValue }, ref) => {
    const [LiveComponentEditor] = remoteModules;
    const [value, setValue] = useState(defaultValue || '');
    useImperativeHandle(ref, () => {
      return {
        getValue: () => value
      };
    });
    return (
      <Flex vertical gap={8}>
        <LiveComponentEditor onChange={setValue} defaultValue={value} />
      </Flex>
    );
  })
);

const CustomComponentFormInner = createWithRemoteLoader({
  modules: ['components-core:FormInfo']
})(({ remoteModules, isEdit }) => {
  const [FormInfo] = remoteModules;
  const { Input, TextArea } = FormInfo.fields;

  return (
    <FormInfo
      column={1}
      list={[
        <Input name="key" label="KEY" rule="REQ LEN-0-100" disabled={isEdit}/>,
        <Input name="name" label="名称" rule="REQ LEN-0-100" />,
        <Input name="type" label="类型" rule="REQ LEN-0-100" />,
        <TextArea name="description" label="描述" rule="LEN-0-500" />
      ]}
    />
  );
});

const Setting = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:Table',
    'components-core:FormInfo',
    'components-core:Modal@useModal',
    'components-core:Modal@ModalButton',
    'components-thirdparty:LiveComponentView'
  ]
})(({ remoteModules, tenant, reload }) => {
  const [usePreset, Table, FormInfo, useModal, ModalButton, LiveComponentView] = remoteModules;
  const { apis, ajax } = usePreset();
  const { useFormModal, TableList, Form } = FormInfo;
  const { Input, Switch } = FormInfo.fields;
  const formModal = useFormModal();
  const { message } = App.useApp();
  const modal = useModal();
  const formInner = (
    <TableList
      title="环境变量"
      name="args"
      minLength={1}
      column={1}
      list={[
        <Input name="key" label="键" rule="REQ LEN-0-100" />,
        <Input name="value" label="值" rule="REQ LEN-0-500" />,
        <Switch name="secret" label="是否密钥" />
      ]}
    />
  );
  const args = tenant.tenantSetting?.args || [];
  const customComponents = tenant.tenantSetting?.customComponents || [];
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
            }}>
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
            title: 'KEY'
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
      <Flex justify="space-between">
        <div></div>
        <Flex gap={8}>
          <Button
            type="primary"
            onClick={() => {
              const modalApi = modal({
                title: '添加自定义组件',
                size: 'large',
                wrapClassName: style['modal-wrap'],
                classNames: {
                  wrapper: style['modal-wrap']
                },
                children: ({ childrenRef }) => <LiveComponent ref={childrenRef} />,
                onConfirm: async (e, { childrenRef }) => {
                  const content = childrenRef.current.getValue();
                  formModal({
                    title: '添加自定义组件',
                    size: 'small',
                    formProps: {
                      onSubmit: async formData => {
                        const { data: resData } = await ajax(
                          Object.assign({}, apis.tenantAdmin.appendCustomComponent, {
                            data: {
                              tenantId: tenant.id,
                              customComponent: Object.assign({}, formData, {
                                content
                              })
                            }
                          })
                        );

                        if (resData.code !== 0) {
                          return false;
                        }
                        message.success('添加成功');
                        modalApi.close();
                        reload();
                      }
                    },
                    children: <CustomComponentFormInner />
                  });
                  return false;
                }
              });
            }}>
            添加自定义组件
          </Button>
        </Flex>
      </Flex>
      <Table
        rowKey="key"
        dataSource={customComponents}
        columns={[
          {
            name: 'key',
            title: 'KEY'
          },
          {
            name: 'name',
            title: '名称'
          },
          {
            name: 'type',
            title: '类型'
          },
          {
            name: 'description',
            title: '描述',
            type: 'description'
          },
          {
            name: 'options',
            type: 'options',
            title: '操作',
            valueOf: item => {
              return [
                {
                  buttonComponent: ModalButton,
                  children: '预览',
                  api: Object.assign({}, apis.tenantAdmin.customComponentDetail, {
                    params: {
                      tenantId: tenant.id,
                      key: item.key
                    }
                  }),
                  modalProps: ({ data }) => {
                    return {
                      title: '预览',
                      footer: null,
                      children: (
                        <Form>
                          <LiveComponentView content={data.content} />
                        </Form>
                      )
                    };
                  }
                },
                {
                  buttonComponent: ModalButton,
                  children: '编辑',
                  api: Object.assign({}, apis.tenantAdmin.customComponentDetail, {
                    params: {
                      tenantId: tenant.id,
                      key: item.key
                    }
                  }),
                  modalProps: ({ data, close }) => {
                    return {
                      title: '编辑',
                      size: 'large',
                      children: ({ childrenRef }) => <LiveComponent defaultValue={data.content} ref={childrenRef} />,
                      onConfirm: (e, { childrenRef }) => {
                        const content = childrenRef.current.getValue();
                        formModal({
                          title: '编辑自定义组件',
                          size: 'small',
                          formProps: {
                            data: Object.assign({}, item),
                            onSubmit: async formData => {
                              const { data: resData } = await ajax(
                                Object.assign({}, apis.tenantAdmin.saveCustomComponent, {
                                  data: {
                                    tenantId: tenant.id,
                                    customComponent: Object.assign({}, formData, {
                                      key: item.key,
                                      content
                                    })
                                  }
                                })
                              );

                              if (resData.code !== 0) {
                                return false;
                              }
                              message.success('修改');
                              close();
                              reload();
                            }
                          },
                          children: <CustomComponentFormInner isEdit />
                        });
                        return false;
                      }
                    };
                  }
                },
                {
                  children: '复制',
                  onClick: async () => {
                    const { data: resData } = await ajax(
                      Object.assign({}, apis.tenantAdmin.copyCustomComponent, {
                        data: {
                          tenantId: tenant.id,
                          key: item.key
                        }
                      })
                    );
                    if (resData.code !== 0) {
                      return;
                    }
                    message.success('复制成功');
                    reload();
                  }
                },
                {
                  children: '删除',
                  confirm: true,
                  onClick: async () => {
                    const { data: resData } = await ajax(
                      Object.assign({}, apis.tenantAdmin.removeCustomComponent, {
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
