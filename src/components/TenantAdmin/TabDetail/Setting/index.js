import { createWithRemoteLoader } from '@kne/remote-loader';
import { Flex, Button, App } from 'antd';
import { useState, forwardRef, useImperativeHandle } from 'react';
import withLocale from '../../withLocale';
import { useIntl } from '@kne/react-intl';
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
})(withLocale(({ remoteModules, isEdit }) => {
  const [FormInfo] = remoteModules;
  const { formatMessage } = useIntl();
  const { Input, TextArea } = FormInfo.fields;

  return (
    <FormInfo
      column={1}
      list={[
        <Input name="key" label="KEY" rule="REQ LEN-0-100" disabled={isEdit}/>,
        <Input name="name" label={formatMessage({ id: 'Name' })} rule="REQ LEN-0-100" />,
        <Input name="type" label={formatMessage({ id: 'Type' })} rule="REQ LEN-0-100" />,
        <TextArea name="description" label={formatMessage({ id: 'Description' })} rule="LEN-0-500" />
      ]}
    />
  );
}));

const Setting = createWithRemoteLoader({
  modules: [
    'components-core:Global@usePreset',
    'components-core:Table',
    'components-core:FormInfo',
    'components-core:Modal@useModal',
    'components-core:Modal@ModalButton',
    'components-thirdparty:LiveComponentView'
  ]
})(withLocale(({ remoteModules, tenant, reload }) => {
  const [usePreset, Table, FormInfo, useModal, ModalButton, LiveComponentView] = remoteModules;
  const { formatMessage } = useIntl();
  const { apis, ajax } = usePreset();
  const { useFormModal, TableList, Form } = FormInfo;
  const { Input, Switch } = FormInfo.fields;
  const formModal = useFormModal();
  const { message } = App.useApp();
  const modal = useModal();
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
            }}>
            {formatMessage({ id: 'AddEnvironmentVariable' })}
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
            title: formatMessage({ id: 'Value' }),
            type: 'description'
          },
          {
            name: 'secret',
            title: formatMessage({ id: 'IsSecret' }),
            type: 'singleRow',
            valueOf: item => String(item.secret !== void 0 ? item.secret : false)
          },
          {
            name: 'options',
            type: 'options',
            title: formatMessage({ id: 'Operation' }),
            fixed: 'right',
            valueOf: item => {
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
      <Flex justify="space-between">
        <div></div>
        <Flex gap={8}>
          <Button
            type="primary"
            onClick={() => {
              const modalApi = modal({
                title: formatMessage({ id: 'AddCustomComponent' }),
                size: 'large',
                wrapClassName: style['modal-wrap'],
                classNames: {
                  wrapper: style['modal-wrap']
                },
                children: ({ childrenRef }) => <LiveComponent ref={childrenRef} />,
                onConfirm: async (e, { childrenRef }) => {
                  const content = childrenRef.current.getValue();
                  formModal({
                    title: formatMessage({ id: 'AddCustomComponent' }),
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
                        message.success(formatMessage({ id: 'AddSuccess' }));
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
            {formatMessage({ id: 'AddCustomComponent' })}
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
            title: formatMessage({ id: 'Name' })
          },
          {
            name: 'type',
            title: formatMessage({ id: 'Type' })
          },
          {
            name: 'description',
            title: formatMessage({ id: 'Description' }),
            type: 'description'
          },
          {
            name: 'options',
            type: 'options',
            title: formatMessage({ id: 'Operation' }),
            fixed: 'right',
            valueOf: item => {
              return [
                {
                  buttonComponent: ModalButton,
                  children: formatMessage({ id: 'Preview' }),
                  api: Object.assign({}, apis.tenantAdmin.customComponentDetail, {
                    params: {
                      tenantId: tenant.id,
                      key: item.key
                    }
                  }),
                  modalProps: ({ data }) => {
                    return {
                      title: formatMessage({ id: 'Preview' }),
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
                  children: formatMessage({ id: 'Edit' }),
                  api: Object.assign({}, apis.tenantAdmin.customComponentDetail, {
                    params: {
                      tenantId: tenant.id,
                      key: item.key
                    }
                  }),
                  modalProps: ({ data, close }) => {
                    return {
                      title: formatMessage({ id: 'Edit' }),
                      size: 'large',
                      children: ({ childrenRef }) => <LiveComponent defaultValue={data.content} ref={childrenRef} />,
                      onConfirm: (e, { childrenRef }) => {
                        const content = childrenRef.current.getValue();
                        formModal({
                          title: formatMessage({ id: 'EditCustomComponent' }),
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
                              message.success(formatMessage({ id: 'ModifySuccess' }));
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
                  children: formatMessage({ id: 'Copy' }),
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
                    message.success(formatMessage({ id: 'CopySuccess' }));
                    reload();
                  }
                },
                {
                  children: formatMessage({ id: 'Delete' }),
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
}));

export default Setting;
